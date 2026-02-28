/**
 * Test script for CreatePoolCommand against Anvil (local).
 *
 * Prerequisites:
 * - Anvil running (e.g. anvil)
 * - Deploy completed (others/deploy-full.sh)
 * - Fee amount enabled for the fee you use (run enable-fee-amount.ts first if needed)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:create-pool
 *
 * Token addresses are read from others/deploy-summary.env (path relative to repo root).
 * Env: ANVIL_RPC_URL, ANVIL_PRIVATE_KEY
 */
import 'reflect-metadata';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Wallet } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { CreatePoolCommand } from '../../src/commands/factory/CreatePoolCommand';
import { CheckPoolExistsQuery } from '../../src/queries/factory/CheckPoolExistsQuery';
import { container } from 'tsyringe';
import { RPC } from '../../src/providers';

const RPC_URL = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.ANVIL_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const logPath = join(process.cwd(), 'scripts/anvil/last-run.log');
const lines: string[] = [];
function log(msg: string) {
  lines.push(msg);
  console.log(msg);
}

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
  throw new Error('others/deploy-summary.env não encontrado (rode a partir da raiz do repo ou defina EVX_TOKEN_A_FET/EVX_TOKEN_B_AVAX)');
}

async function main() {
  const summary = loadDeploySummary();
  const tokenA = process.env.EVX_TOKEN_A_FET ?? summary.EVX_TOKEN_A_FET;
  const tokenB = process.env.EVX_TOKEN_B_AVAX ?? summary.EVX_TOKEN_B_AVAX;
  if (!tokenA || !tokenB) {
    throw new Error('EVX_TOKEN_A_FET e EVX_TOKEN_B_AVAX não encontrados em deploy-summary.env');
  }

  log('Configuring SDK for Anvil...');
  await setRPCProvider(RPC_URL);
  await setAllChain('anvil');
  const rpc = container.resolve(RPC);
  if (!rpc.provider) throw new Error('Provider not set');
  const signer = new Wallet(PRIVATE_KEY, rpc.provider);
  await setAllSigner(signer);

  const command = container.resolve(CreatePoolCommand);
  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB;
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA;
  const fee = BigInt(3000);

  let createFailed = false;
  log(`\nCreating pool token0=${token0} token1=${token1} fee=${fee}...`);
  await command.execute({
    token0,
    token1,
    fee,
    onTransaction: (hash) => log('  tx: ' + hash),
    onDone: (receipt) => log('  confirmed: ' + (receipt?.hash ?? String(receipt))),
    onFail: (err) => {
      createFailed = true;
      const msg = err?.message ?? String(err);
      if (msg.includes('0xf48e3c26') || msg.includes('PoolExists')) {
        log('  (pool já existe para este par/fee)');
      } else {
        log('  error: ' + msg);
      }
    }
  });
  try {
    const checkPool = container.resolve(CheckPoolExistsQuery);
    const { poolAddress, exists } = await checkPool.execute({ token0, token1, fee });
    log('  pool: ' + poolAddress);
    if (createFailed && exists) {
      log('  → use o endereço acima (pool já estava criada).');
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('could not decode result data') || msg.includes('BAD_DATA') || msg.includes('value="0x"')) {
      log('  pool: (getPool retornou vazio; confira EVX_FACTORY_ADDRESS em chains.ts ou extraia o endereço do evento PoolCreated no receipt da tx acima)');
    } else {
      throw e;
    }
  }
  log('\nDone.');
  writeFileSync(logPath, lines.join('\n'));
}

main().catch((e) => {
  lines.push('FATAL: ' + String(e));
  writeFileSync(logPath, lines.join('\n'));
  console.error(e);
  process.exit(1);
});
