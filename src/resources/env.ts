import { ChainName, chains } from "./chains";
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: `${__dirname}/../../.env` });

export const env = {
  rpcUrl: process.env.RPC_URL,
  chain: process.env.CHAIN as ChainName,
};

// Environment validations
if (!env.rpcUrl) {
  console.error(`Environment variable "RPC_URL" not found. Exiting...`);
  process.exit(1);
}

const chain = env.chain in chains ? env.chain : 'mainnet';

if (chain !== env.chain) {
  console.error(`Environment variable "CHAIN" set to "${env.chain}" is invalid. Falling back to "mainnet".`);
  env.chain = 'mainnet';
}
