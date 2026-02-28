/**
 * Script to initialize a pool (set initial price via InitializeObservation).
 *
 * Prerequisites:
 * - Anvil running (e.g. anvil)
 * - Deploy completed (others/deploy-full.sh)
 * - Pool created and not yet initialized (run create-pool.ts then this script)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:initialize-pool
 *
 * Token addresses are read from others/deploy-summary.env.
 * Env: ANVIL_RPC_URL, ANVIL_PRIVATE_KEY
 * Price: optional, one of:
 *   - EVX_INITIAL_SQRT_PRICE_X96  (e.g. 79228162514264337593543950336 for 1:1 with 18 decimals)
 *   - EVX_INITIAL_PRICE           (decimal, e.g. 1.0 = price of token0 in terms of token1; uses 18 decimals for both)
 *   If neither is set, uses 5000 (between 1000 and 10000).
 * Optional: EVX_POOL_ADDRESS, EVX_POOL_FEE (default 3000) to resolve pool from factory.
 */
import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Wallet } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { InitializePoolCommand } from '../../src/commands/pool/InitializePoolCommand';
import { CheckPoolExistsQuery } from '../../src/queries/factory/CheckPoolExistsQuery';
import { GetSlot0Query } from '../../src/queries/pool/GetSlot0Query';
import { decimalToSqrtX96Price } from '../../src/utils/prices';
import { container } from 'tsyringe';
import { RPC } from '../../src/providers';

const RPC_URL = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.ANVIL_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const FEE = BigInt(process.env.EVX_POOL_FEE ?? '3000');
const DEFAULT_DECIMALS = 18;

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

function parseInitialPrice(): bigint {
  const rawSqrt = process.env.EVX_INITIAL_SQRT_PRICE_X96?.trim();
  if (rawSqrt) {
    const value = BigInt(rawSqrt);
    if (value <= 0n) throw new Error('EVX_INITIAL_SQRT_PRICE_X96 deve ser > 0');
    return value;
  }
  const rawPrice = process.env.EVX_INITIAL_PRICE?.trim();
  if (rawPrice) {
    const price = parseFloat(rawPrice);
    if (!Number.isFinite(price) || price <= 0) throw new Error('EVX_INITIAL_PRICE deve ser um número > 0');
    return decimalToSqrtX96Price(price, DEFAULT_DECIMALS, DEFAULT_DECIMALS);
  }
  // Default: 5000 (preço entre 1000 e 10000)
  return decimalToSqrtX96Price(5000, DEFAULT_DECIMALS, DEFAULT_DECIMALS);
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
  const initialPrice = parseInitialPrice();

  console.log('Configuring SDK for Anvil...');
  await setRPCProvider(RPC_URL);
  await setAllChain('anvil');
  const rpc = container.resolve(RPC);
  if (!rpc.provider) throw new Error('Provider not set');
  const signer = new Wallet(PRIVATE_KEY, rpc.provider);
  await setAllSigner(signer);

  let poolAddress: string;
  const explicitPool = process.env.EVX_POOL_ADDRESS?.trim();
  if (explicitPool) {
    poolAddress = explicitPool;
    console.log('Using pool from EVX_POOL_ADDRESS:', poolAddress);
  } else {
    const checkPool = container.resolve(CheckPoolExistsQuery);
    const { poolAddress: addr, exists } = await checkPool.execute({ token0, token1, fee: FEE });
    if (!exists) {
      console.error('Pool não existe para token0=%s token1=%s fee=%s', token0, token1, FEE);
      process.exit(1);
    }
    poolAddress = addr;
    console.log('Pool address:', poolAddress);
  }

  const getSlot0 = container.resolve(GetSlot0Query);
  const slot0 = await getSlot0.execute({ poolAddress });
  if (slot0.sqrtPriceX96 !== 0n) {
    console.log('Pool já está inicializada (sqrtPriceX96 != 0). Nada a fazer.');
    console.log('  sqrtPriceX96:', slot0.sqrtPriceX96.toString(), 'tick:', slot0.tick);
    return;
  }

  console.log('Initializing pool with sqrtPriceX96:', initialPrice.toString());
  let failed = false;
  const command = container.resolve(InitializePoolCommand);
  await command.execute({
    poolAddress,
    signer,
    initialPrice,
    onTransaction: (hash) => console.log('  tx:', hash),
    onDone: (receipt) => console.log('  confirmed:', receipt?.hash ?? String(receipt)),
    onFail: (err) => {
      failed = true;
      console.error('  error:', err?.message ?? err);
    }
  });

  if (failed) {
    process.exit(1);
  }
  console.log('Done. Run script:anvil:check-pool-initialized to verify.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
