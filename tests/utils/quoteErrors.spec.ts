import { Interface, id } from 'ethers';
import {
  decodeQuoteErrorCode,
  QuoteSdkError,
  rethrowQuoteError
} from '@utils';

describe('quoteErrors AD-26 decoder', () => {
  const iface = new Interface([
    'error ZeroLiquidity()',
    'error InsufficientLiquidity()',
    'error InvalidRoute()',
    'error ArithmeticInternal()',
    'error PoolQuoteFailed(bytes)',
    'error NoOpSwap()',
    'error PoolNotFound(address,address,uint24)'
  ]);

  it('maps typed custom errors to AD-26 codes', () => {
    expect(decodeQuoteErrorCode(iface.encodeErrorResult('ZeroLiquidity', []))).toBe(
      'zero_liquidity'
    );
    expect(
      decodeQuoteErrorCode(iface.encodeErrorResult('InsufficientLiquidity', []))
    ).toBe('insufficient_liquidity');
    expect(decodeQuoteErrorCode(iface.encodeErrorResult('InvalidRoute', []))).toBe(
      'invalid_route'
    );
    expect(
      decodeQuoteErrorCode(iface.encodeErrorResult('ArithmeticInternal', []))
    ).toBe('arithmetic_internal');
  });

  it('does not map Panic(0x11) to any AD-26 code (no Panic→arithmetic_internal)', () => {
    const panic11 =
      '0x4e487b710000000000000000000000000000000000000000000000000000000000000011';
    expect(decodeQuoteErrorCode(panic11)).toBeUndefined();
  });

  it('does not map PoolQuoteFailed(Panic) to AD-26', () => {
    const panic11 =
      '0x4e487b710000000000000000000000000000000000000000000000000000000000000011';
    const wrapped = iface.encodeErrorResult('PoolQuoteFailed', [panic11]);
    expect(decodeQuoteErrorCode(wrapped)).toBeUndefined();
  });

  it('unwraps PoolQuoteFailed(InsufficientLiquidity) to insufficient_liquidity', () => {
    const inner = iface.encodeErrorResult('InsufficientLiquidity', []);
    const wrapped = iface.encodeErrorResult('PoolQuoteFailed', [inner]);
    expect(decodeQuoteErrorCode(wrapped)).toBe('insufficient_liquidity');
  });

  it('unwraps PoolQuoteFailed(ArithmeticInternal) to arithmetic_internal', () => {
    const inner = iface.encodeErrorResult('ArithmeticInternal', []);
    const wrapped = iface.encodeErrorResult('PoolQuoteFailed', [inner]);
    expect(decodeQuoteErrorCode(wrapped)).toBe('arithmetic_internal');
  });

  it('rethrowQuoteError attaches code only for typed errors', () => {
    const data = iface.encodeErrorResult('InsufficientLiquidity', []);
    expect(() =>
      rethrowQuoteError({ code: 'CALL_EXCEPTION', data })
    ).toThrow(QuoteSdkError);

    try {
      rethrowQuoteError({ code: 'CALL_EXCEPTION', data });
    } catch (err) {
      expect(err).toBeInstanceOf(QuoteSdkError);
      expect((err as QuoteSdkError).code).toBe('insufficient_liquidity');
    }
  });

  it('rethrowQuoteError reads data from error.data and object-shaped info.error.data', () => {
    const data = iface.encodeErrorResult('ZeroLiquidity', []);

    expect(() =>
      rethrowQuoteError({ code: 'CALL_EXCEPTION', error: { data } })
    ).toThrow(QuoteSdkError);

    expect(() =>
      rethrowQuoteError({
        code: 'CALL_EXCEPTION',
        info: { error: { data: { data } } }
      })
    ).toThrow(QuoteSdkError);

    try {
      rethrowQuoteError({ code: 'CALL_EXCEPTION', error: { data } });
    } catch (err) {
      expect((err as QuoteSdkError).code).toBe('zero_liquidity');
    }
  });

  it('opaque CALL_EXCEPTION without typed data keeps no AD-26 code', () => {
    const opaque = { code: 'CALL_EXCEPTION', message: 'execution reverted' };
    expect(() => rethrowQuoteError(opaque)).toThrow();
    try {
      rethrowQuoteError(opaque);
    } catch (err) {
      expect(err).not.toBeInstanceOf(QuoteSdkError);
      expect((err as { code?: string }).code).toBe('CALL_EXCEPTION');
      expect((err as { code?: string }).code).not.toBe('arithmetic_internal');
    }
  });

  it('selector sanity: InsufficientLiquidity is not Panic', () => {
    const insuff = iface.getError('InsufficientLiquidity')!.selector;
    expect(insuff).toBe(id('InsufficientLiquidity()').slice(0, 10));
    expect(insuff).not.toBe('0x4e487b71');
  });
});
