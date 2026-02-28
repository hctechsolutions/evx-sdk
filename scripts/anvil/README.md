# Anvil test scripts (factory commands)

Scripts to run SDK factory commands against a local Anvil deployment.

**Prerequisites**

- Anvil running (`anvil`)
- Protocol deployed with `others/deploy-full.sh` (so `others/deploy-summary.env` and `evx-sdk` chain `anvil` are in sync)

**Sync addresses after deploy**

The SDK reads addresses from `src/resources/chains.ts` under the `anvil` key. After a new deploy, update `chains.ts` with the values from `others/deploy-summary.env` (or run a script that copies them).

**Run**

```bash
# From evx-sdk root
npm run script:anvil:enable-fee-amount   # Enable fee tiers on the factory
npm run script:anvil:create-pool         # Create a pool (FET/AVAX, fee 3000)
```

Optional env:

- `ANVIL_RPC_URL` – default `http://127.0.0.1:8545`
- `ANVIL_PRIVATE_KEY` – default Anvil account #0

Example with custom RPC and key:

```bash
ANVIL_RPC_URL=http://127.0.0.1:8545 ANVIL_PRIVATE_KEY=0xac0974... npx tsx scripts/anvil/create-pool.ts
```
