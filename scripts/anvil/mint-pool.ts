/**
 * Script to mint a position (add liquidity) in the pool via PositionManager.
 *
 * Prerequisites:
 * - Anvil running, deploy done, pool created and initialized
 * - Tokens approved for the PositionManager (or script may fail)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:mint
 *
 * Token addresses from others/deploy-summary.env.
 * Env: ANVIL_RPC_URL, ANVIL_PRIVATE_KEY
 * Optional: EVX_POOL_ADDRESS, EVX_POOL_FEE (default 3000)
 * Optional: EVX_MINT_AMOUNT0_DESIRED, EVX_MINT_AMOUNT1_DESIRED (default: random between 0.5e18 and 5e18)
 * Optional: EVX_MINT_TICK_RANGE (default: random between 3 and 12 intervals each side)
 */
import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Wallet, Contract } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { chains } from '../../src/resources/chains';
import { MintCommand } from '../../src/commands/position-manager/MintCommand';
import { CheckPoolExistsQuery } from '../../src/queries/factory/CheckPoolExistsQuery';
import { GetSlot0Query } from '../../src/queries/pool/GetSlot0Query';
import { container } from 'tsyringe';
import { RPC } from '../../src/providers';

const RPC_URL = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const PRIVATE_KEY =
  process.env.ANVIL_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const FEE = Number(process.env.EVX_POOL_FEE ?? '3000');
const TICK_SPACING_BY_FEE: Record<number, number> = {
  500: 10,
  3000: 60,
  10000: 200
};

/** Random integer in [min, max] inclusive */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random amount in 18 decimals between minE18 and maxE18 */
function randomAmountE18(minE18: number, maxE18: number): bigint {
  const r = minE18 + Math.random() * (maxE18 - minE18);
  return BigInt(Math.floor(r));
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
  throw new Error(
    'others/deploy-summary.env não encontrado (rode a partir da raiz do repo ou defina EVX_TOKEN_A_FET/EVX_TOKEN_B_AVAX)'
  );
}

function ticksAroundCurrent(currentTick: number, tickSpacing: number, rangeIntervals: number): { tickLower: number; tickUpper: number } {
  const tickLower = Math.floor((currentTick - rangeIntervals * tickSpacing) / tickSpacing) * tickSpacing;
  const tickUpper = Math.ceil((currentTick + rangeIntervals * tickSpacing) / tickSpacing) * tickSpacing;
  return { tickLower, tickUpper };
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
  const tickSpacing = TICK_SPACING_BY_FEE[FEE] ?? 60;
  const rangeIntervals = process.env.EVX_MINT_TICK_RANGE
    ? Math.max(1, Number(process.env.EVX_MINT_TICK_RANGE))
    : randomInt(3, 12);
  const amount0Desired = process.env.EVX_MINT_AMOUNT0_DESIRED
    ? BigInt(process.env.EVX_MINT_AMOUNT0_DESIRED)
    : randomAmountE18(0.5e18, 5e18);
  const amount1Desired = process.env.EVX_MINT_AMOUNT1_DESIRED
    ? BigInt(process.env.EVX_MINT_AMOUNT1_DESIRED)
    : randomAmountE18(0.5e18, 5e18);

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
    const { poolAddress: addr, exists } = await checkPool.execute({ token0, token1, fee: BigInt(FEE) });
    if (!exists) {
      console.error('Pool não existe para token0=%s token1=%s fee=%s', token0, token1, FEE);
      process.exit(1);
    }
    poolAddress = addr;
    console.log('Pool address:', poolAddress);
  }

  const getSlot0 = container.resolve(GetSlot0Query);
  const slot0 = await getSlot0.execute({ poolAddress });
  if (slot0.sqrtPriceX96 === 0n) {
    console.error('Pool não está inicializada. Rode script:anvil:initialize-pool antes.');
    process.exit(1);
  }

  const { tickLower, tickUpper } = ticksAroundCurrent(slot0.tick, tickSpacing, rangeIntervals);
  const recipient = await signer.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const positionManagerAddress = chains.anvil?.contracts?.positionManager;
  if (positionManagerAddress && rpc.provider) {
    const erc20 = [
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    const c0 = new Contract(token0, erc20, rpc.provider);
    const c1 = new Contract(token1, erc20, rpc.provider);
    const [balance0, balance1, allowance0, allowance1] = await Promise.all([
      c0.balanceOf(recipient),
      c1.balanceOf(recipient),
      c0.allowance(recipient, positionManagerAddress),
      c1.allowance(recipient, positionManagerAddress)
    ]);
    if (balance0 < amount0Desired || balance1 < amount1Desired || allowance0 < amount0Desired || allowance1 < amount1Desired) {
      console.error('Saldo ou allowance insuficiente para o PositionManager.');
      console.error('  PositionManager:', positionManagerAddress);
      console.error('  token0: balance', balance0.toString(), 'need', amount0Desired.toString(), 'allowance', allowance0.toString());
      console.error('  token1: balance', balance1.toString(), 'need', amount1Desired.toString(), 'allowance', allowance1.toString());
      console.error('  Faça approve de token0 e token1 para o PositionManager e garanta saldo suficiente.');
      process.exit(1);
    }
  }

  console.log('Minting position...');
  console.log('  token0:', token0);
  console.log('  token1:', token1);
  console.log('  fee:', FEE);
  console.log('  tickLower:', tickLower, 'tickUpper:', tickUpper);
  console.log('  amount0Desired:', amount0Desired.toString(), 'amount1Desired:', amount1Desired.toString());
  console.log('  recipient:', recipient);

  let failed = false;
  const command = container.resolve(MintCommand);
  await command.execute({
    token0,
    token1,
    fee: FEE,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    amount0Min: 0n,
    amount1Min: 0n,
    recipient,
    deadline,
    onTransaction: (hash) => console.log('  tx:', hash),
    onDone: (receipt) => console.log('  confirmed:', receipt?.hash ?? String(receipt)),
    onFail: (err) => {
      failed = true;
      const msg = err?.message ?? String(err);
      console.error('  error:', msg);
      if (msg.includes('require(false)') || msg.includes('no data present') || msg.includes('CALL_EXCEPTION')) {
        console.error('  → Verifique saldo e approve de token0/token1 para o PositionManager.');
      }
    }
  });

  if (failed) {
    process.exit(1);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
