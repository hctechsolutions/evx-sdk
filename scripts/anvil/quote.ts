/**
 * Script to test swap quotes on Anvil (exact input and exact output single).
 *
 * Prerequisites:
 * - Anvil running, deploy done, pool created and initialized (and ideally with liquidity)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:quote
 *
 * Token addresses from others/deploy-summary.env.
 * Env: ANVIL_RPC_URL, ANVIL_PRIVATE_KEY
 * Optional: EVX_POOL_FEE (default 3000)
 * Optional: EVX_QUOTE_AMOUNT - amount for exact input quote in wei (default: 1e18)
 * Optional: EVX_QUOTE_AMOUNT_OUT - amount desired out for exact output quote in wei (default: 1e16; valores grandes podem causar OutputAmountMismatch por arredondamento)
 */
import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Wallet } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { QuoteExactInputSingleQuery } from '../../src/queries/quoter/QuoteExactInputSingleQuery';
import { QuoteExactOutputSingleQuery } from '../../src/queries/quoter/QuoteExactOutputSingleQuery';
import { CheckPoolExistsQuery } from '../../src/queries/factory/CheckPoolExistsQuery';
import { GetSlot0Query } from '../../src/queries/pool/GetSlot0Query';
import { container } from 'tsyringe';
import { RPC } from '../../src/providers';

const RPC_URL = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.ANVIL_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const FEE = BigInt(process.env.EVX_POOL_FEE ?? '3000');
const QUOTE_AMOUNT = process.env.EVX_QUOTE_AMOUNT ? BigInt(process.env.EVX_QUOTE_AMOUNT) : BigInt(1e18);
const QUOTE_AMOUNT_OUT = process.env.EVX_QUOTE_AMOUNT_OUT
  ? BigInt(process.env.EVX_QUOTE_AMOUNT_OUT)
  : BigInt(1e16);

function loadDeploySummary(): Record<string, string> {
  const candidates = [
    join(process.cwd(), '../others/deploy-summary.env'),
    join(process.cwd(), '../../others/deploy-summary.env')
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      const raw = readFileSync(p, 'utf-8');
      const out: Record<string, string> = {};
      for (const line of raw.split('\n')) {
        const m = line.match(/^export\s+(\w+)=(.+)$/);
        if (m) out[m[1].trim()] = m[2].trim();
      }
      return out;
    }
  }
  throw new Error(
    'others/deploy-summary.env não encontrado (rode a partir da raiz do repo ou defina EVX_TOKEN_A_FET/EVX_TOKEN_B_AVAX)'
  );
}

async function main() {
  const summary = loadDeploySummary();
  const tokenA = process.env.EVX_TOKEN_A_FET ?? summary.EVX_TOKEN_A_FET;
  const tokenB = process.env.EVX_TOKEN_B_AVAX ?? summary.EVX_TOKEN_B_AVAX;
  if (!tokenA || !tokenB) {
    throw new Error('EVX_TOKEN_A_FET e EVX_TOKEN_B_AVAX não encontrados em deploy-summary.env');
  }

  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB;
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA;

  console.log('Configuring SDK for Anvil...');
  await setRPCProvider(RPC_URL);
  await setAllChain('anvil');
  const rpc = container.resolve(RPC);
  if (!rpc.provider) throw new Error('Provider not set');
  const signer = new Wallet(PRIVATE_KEY, rpc.provider);
  await setAllSigner(signer);

  const checkPool = container.resolve(CheckPoolExistsQuery);
  const { poolAddress, exists } = await checkPool.execute({ token0, token1, fee: FEE });
  if (!exists) {
    console.error('Pool não existe para token0=%s token1=%s fee=%s', token0, token1, FEE);
    process.exit(1);
  }
  console.log('Pool:', poolAddress);

  const getSlot0 = container.resolve(GetSlot0Query);
  const slot0 = await getSlot0.execute({ poolAddress });
  if (slot0.sqrtPriceX96 === 0n) {
    console.error('Pool não inicializada. Rode script:anvil:initialize-pool antes.');
    process.exit(1);
  }

  const quoteExactInput = container.resolve(QuoteExactInputSingleQuery);
  const quoteExactOutput = container.resolve(QuoteExactOutputSingleQuery);

  // sqrtPriceLimitX96 = 0 means no limit (swap as much as possible in the direction of the swap)
  const noLimit = 0n;

  console.log('\n--- Quote Exact Input Single ---');
  console.log('  (Quanto recebo se vendo X de um token?)');

  try {
    const outToken0ToToken1 = await quoteExactInput.execute({
      tokenIn: token0,
      tokenOut: token1,
      fee: FEE,
      amountIn: QUOTE_AMOUNT,
      sqrtPriceLimitX96: noLimit
    });
    console.log(`  token0 -> token1: amountIn=${QUOTE_AMOUNT.toString()} => amountOut=${outToken0ToToken1.amountOut.toString()}`);
    console.log(`    gasEstimate=${outToken0ToToken1.gasEstimate.toString()} initializedTicksCrossed=${outToken0ToToken1.initializedTicksCrossed}`);
  } catch (e: any) {
    console.error('  token0 -> token1:', e?.message ?? e);
  }

  try {
    const outToken1ToToken0 = await quoteExactInput.execute({
      tokenIn: token1,
      tokenOut: token0,
      fee: FEE,
      amountIn: QUOTE_AMOUNT,
      sqrtPriceLimitX96: noLimit
    });
    console.log(`  token1 -> token0: amountIn=${QUOTE_AMOUNT.toString()} => amountOut=${outToken1ToToken0.amountOut.toString()}`);
    console.log(`    gasEstimate=${outToken1ToToken0.gasEstimate.toString()} initializedTicksCrossed=${outToken1ToToken0.initializedTicksCrossed}`);
  } catch (e: any) {
    console.error('  token1 -> token0:', e?.message ?? e);
  }

  console.log('\n--- Quote Exact Output Single ---');
  console.log('  (Quanto preciso enviar para receber X do outro token?)');

  try {
    const outExactOut = await quoteExactOutput.execute({
      tokenIn: token0,
      tokenOut: token1,
      amount: QUOTE_AMOUNT_OUT,
      fee: FEE,
      sqrtPriceLimitX96: noLimit
    });
    console.log(
      `  token0 -> token1: amountOut=${QUOTE_AMOUNT_OUT.toString()} => amountIn=${outExactOut.amountIn.toString()}`
    );
    console.log(`    gasEstimate=${outExactOut.gasEstimate.toString()} initializedTicksCrossed=${outExactOut.initializedTicksCrossed}`);
  } catch (e: any) {
    console.error('  token0 -> token1 (exact out):', e?.message ?? e);
  }

  try {
    const outExactOutRev = await quoteExactOutput.execute({
      tokenIn: token1,
      tokenOut: token0,
      amount: QUOTE_AMOUNT_OUT,
      fee: FEE,
      sqrtPriceLimitX96: noLimit
    });
    console.log(
      `  token1 -> token0: amountOut=${QUOTE_AMOUNT_OUT.toString()} => amountIn=${outExactOutRev.amountIn.toString()}`
    );
    console.log(`    gasEstimate=${outExactOutRev.gasEstimate.toString()} initializedTicksCrossed=${outExactOutRev.initializedTicksCrossed}`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error('  token1 -> token0 (exact out):', msg);
    if (msg.includes('OutputAmountMismatch')) {
      console.error('    (Exact output nessa direção pode falhar por arredondamento no pool; tente EVX_QUOTE_AMOUNT_OUT menor, ex: 1e16)');
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
