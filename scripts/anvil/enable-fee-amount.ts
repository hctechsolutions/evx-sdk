/**
 * Test script for EnableFeeAmountCommand against Anvil (local).
 *
 * Prerequisites:
 * - Anvil running (e.g. anvil)
 * - Deploy completed so factory exists (others/deploy-full.sh)
 *
 * Usage:
 *   cd evx-sdk && npm run script:anvil:enable-fee-amount
 *   ANVIL_RPC_URL=http://127.0.0.1:8545 ANVIL_PRIVATE_KEY=0x... npx tsx scripts/anvil/enable-fee-amount.ts
 *
 * Optional env:
 *   ANVIL_RPC_URL  - default http://127.0.0.1:8545
 *   ANVIL_PRIVATE_KEY - default Anvil account #0
 */
import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Wallet } from 'ethers';
import { setRPCProvider, setAllChain, setAllSigner } from '../../src/resources/settings';
import { EnableFeeAmountCommand } from '../../src/commands/factory/EnableFeeAmountCommand';
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

async function main() {
  log('Configuring SDK for Anvil...');
  await setRPCProvider(RPC_URL);
  await setAllChain('anvil');
  const rpc = container.resolve(RPC);
  if (!rpc.provider) throw new Error('Provider not set');
  const signer = new Wallet(PRIVATE_KEY, rpc.provider);
  await setAllSigner(signer);

  const command = container.resolve(EnableFeeAmountCommand);

  const feeTiers: { fee: bigint; tickSpacing: bigint }[] = [
    { fee: BigInt(500), tickSpacing: BigInt(10) },
    { fee: BigInt(3000), tickSpacing: BigInt(60) },
    { fee: BigInt(10000), tickSpacing: BigInt(200) }
  ];

  for (const { fee, tickSpacing } of feeTiers) {
    log(`\nEnabling fee=${fee} tickSpacing=${tickSpacing}...`);
    await command.execute({
      fee,
      tickSpacing,
      onTransaction: (hash) => log('  tx: ' + hash),
      onDone: (receipt) => log('  confirmed: ' + (receipt?.hash ?? String(receipt))),
      onFail: (err) => log('  error: ' + String(err))
    });
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
