import { PositionManagerContract } from '@contracts';
import { FactoryContract } from '@contracts';
import { LimitOrderExecutorContract } from '@contracts';
import { ChainName } from '@resources';
import { container } from 'tsyringe';
import { RPC } from '@providers';
import { Signer } from 'ethers';
import { chains } from './chains';

/**
 * @notice Gets all writer contracts that need signer and chain updates
 * @returns Array of contract instances that need configuration
 */
function getWriterContracts() {
  return [
    container.resolve(PositionManagerContract), 
    container.resolve(FactoryContract),
    container.resolve(LimitOrderExecutorContract)
  ];
}

/**
 * @title Set All Signer
 * @notice Sets the signer for all writer contracts
 * @param signer The signer to use for transactions
 */
export async function setAllSigner(signer: Signer) {
  await Promise.all(getWriterContracts().map((c) => c.setSigner(signer)));
}

/**
 * @title Set All Chain
 * @notice Sets the chain for all writer contracts
 * @param chain The chain to use for contract interactions
 */
export async function setAllChain(chain: ChainName) {
  await Promise.all(getWriterContracts().map((c) => c.setChain(chain)));
}

/**
 * @title Set RPC Provider
 * @notice Sets the RPC provider URL for the SDK
 * @param rpcUrl The RPC URL to connect to
 */
export async function setRPCProvider(rpcUrl: string): Promise<void> {
  const rpc = container.resolve(RPC);
  rpc.setProvider(rpcUrl);
}

/**
 * @title Settings Configuration
 * @notice Global settings and configuration for the SDK
 * @dev Contains default values and configuration options
 */
export const settings = {
  // Default chain configuration
  defaultChain: 'sepolia' as keyof typeof chains,
  
  // RPC configuration
  rpc: {
    timeout: 30000, // 30 seconds
    retries: 3,
    batchSize: 100
  },

  // Transaction configuration
  transaction: {
    gasLimit: 500000,
    maxFeePerGas: 20000000000n, // 20 gwei
    maxPriorityFeePerGas: 1500000000n, // 1.5 gwei
    confirmations: 1
  },

  // Gelato Network configuration
  gelato: {
    // Gelato API endpoints
    api: {
      sepolia: 'https://api.gelato.digital',
      mainnet: 'https://api.gelato.digital'
    },
    // Default gas settings for Gelato tasks
    gas: {
      maxFee: 20000000000n, // 20 gwei
      maxPriorityFee: 1500000000n, // 1.5 gwei
      limit: 500000
    },
    // Task execution settings
    task: {
      interval: 30, // 30 seconds
      maxRetries: 3,
      timeout: 300 // 5 minutes
    }
  },

  // Event listener configuration
  events: {
    pollInterval: 1000, // 1 second
    maxBlockRange: 1000,
    retryAttempts: 3
  },

  // Query configuration
  queries: {
    timeout: 10000, // 10 seconds
    retries: 2,
    batchSize: 50
  }
};
