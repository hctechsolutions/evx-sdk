/**
 * Script to check if the pool (token0/token1/fee) is initialized.
 *
 * Prerequisites:
 * - Anvil running (e.g. anvil)
 * - Deploy completed (others/deploy-full.sh)
 * - Pool created (run create-pool.ts first if needed)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:check-pool-initialized
 *
 * Token addresses are read from others/deploy-summary.env (path relative to repo root).
 * Env: ANVIL_RPC_URL, ANVIL_PRIVATE_KEY
 * Optional: EVX_POOL_ADDRESS to check a specific pool; otherwise uses token0/token1/fee from deploy-summary.
 */
import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Wallet } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { CheckPoolExistsQuery } from '../../src/queries/factory/CheckPoolExistsQuery';
import { GetSlot0Query } from '../../src/queries/pool/GetSlot0Query';
import { container } from 'tsyringe';
import { RPC } from '../../src/providers';

const RPC_URL = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.ANVIL_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const FEE = BigInt(process.env.EVX_POOL_FEE ?? '3000');

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
    console.log('Pool address (token0/token1/fee):', poolAddress);
  }

  const getSlot0 = container.resolve(GetSlot0Query);
  const slot0 = await getSlot0.execute({ poolAddress });

  if (slot0.sqrtPriceX96 === 0n) {
    console.log('Pool NÃO inicializada (sqrtPriceX96 = 0).');
    return;
  }

  console.log('Pool inicializada.');
  console.log('  sqrtPriceX96:', slot0.sqrtPriceX96.toString());
  console.log('  tick:', slot0.tick);
  console.log('  observationCardinality:', slot0.observationCardinality);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
