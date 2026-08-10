/**
 * @title Quoter AD-26 error decoding
 * @notice Maps typed Quoter custom errors to stable quote error codes.
 * @dev Never maps Panic(0x11) / PoolQuoteFailed / opaque reverts to AD-26 codes.
 */
import { Interface, hexlify, getBytes } from 'ethers';
import QuoterABI from '@abis/Quoter.json';

export const QUOTE_ERROR_CODES = [
  'zero_liquidity',
  'insufficient_liquidity',
  'invalid_route',
  'arithmetic_internal'
] as const;

export type QuoteErrorCode = (typeof QUOTE_ERROR_CODES)[number];

const ERROR_NAME_TO_CODE: Record<string, QuoteErrorCode> = {
  ZeroLiquidity: 'zero_liquidity',
  NoOpSwap: 'zero_liquidity',
  InsufficientLiquidity: 'insufficient_liquidity',
  InvalidRoute: 'invalid_route',
  PoolNotFound: 'invalid_route',
  ArithmeticInternal: 'arithmetic_internal'
};

const quoterInterface = new Interface(QuoterABI as never);

const PANIC_SELECTOR = '0x4e487b71';

export class QuoteSdkError extends Error {
  readonly code: QuoteErrorCode;

  constructor(code: QuoteErrorCode, message?: string) {
    super(message ?? `Quote failed: ${code}`);
    this.name = 'QuoteSdkError';
    this.code = code;
  }
}

function extractRevertData(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as Record<string, unknown>;

  const asHex = (v: unknown): string | undefined =>
    typeof v === 'string' && v.startsWith('0x') ? v : undefined;

  const fromDataField = (data: unknown): string | undefined => {
    const direct = asHex(data);
    if (direct) return direct;
    if (data && typeof data === 'object') {
      const nested = data as Record<string, unknown>;
      return asHex(nested.data);
    }
    return undefined;
  };

  const top = fromDataField(e.data);
  if (top) return top;

  // ethers v6: nested under error.data
  if (e.error && typeof e.error === 'object') {
    const fromError = fromDataField((e.error as Record<string, unknown>).data);
    if (fromError) return fromError;
  }

  if (typeof e.info === 'object' && e.info) {
    const info = e.info as Record<string, unknown>;
    if (typeof info.error === 'object' && info.error) {
      const nested = info.error as Record<string, unknown>;
      const fromInfo = fromDataField(nested.data);
      if (fromInfo) return fromInfo;
    }
  }
  return undefined;
}

function isPanicSelector(data: string): boolean {
  return data.slice(0, 10).toLowerCase() === PANIC_SELECTOR;
}

/**
 * Decode revert data to an AD-26 code when the custom error is known.
 * Returns undefined for opaque / Panic / PoolQuoteFailed (unclassified).
 * Does NOT map Panic(0x11) → arithmetic_internal.
 */
export function decodeQuoteErrorCode(data: string | undefined): QuoteErrorCode | undefined {
  if (!data || data === '0x' || data.length < 10) return undefined;
  if (isPanicSelector(data)) return undefined;

  try {
    const parsed = quoterInterface.parseError(data);
    if (!parsed) return undefined;

    if (parsed.name === 'PoolQuoteFailed') {
      // Opaque wrapper — inspect inner bytes but never invent AD-26 from Panic.
      const reason = parsed.args[0] as string | Uint8Array;
      const inner =
        typeof reason === 'string' ? reason : hexlify(getBytes(reason));
      if (!inner || inner === '0x' || isPanicSelector(inner)) return undefined;
      return decodeQuoteErrorCode(inner);
    }

    return ERROR_NAME_TO_CODE[parsed.name];
  } catch {
    return undefined;
  }
}

/**
 * Re-throw SDK/ethers failures with `code` set only for typed AD-26 errors.
 * Opaque CALL_EXCEPTION / Panic remain without AD-26 code.
 */
export function rethrowQuoteError(err: unknown): never {
  if (err instanceof QuoteSdkError) throw err;

  const data = extractRevertData(err);
  const code = decodeQuoteErrorCode(data);
  if (code) {
    throw new QuoteSdkError(code);
  }

  throw err;
}
