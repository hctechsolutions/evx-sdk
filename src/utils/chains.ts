import { chains } from '@resources';
import { ChainName, ChainId } from '@interfaces';

/**
 * @title Get Chain ID Function
 * @notice Returns the chain ID for a given chain name
 * @param chainName The name of the chain
 * @returns The chain ID
 * @throws Error if chain is not found
 */
export function getChainId(chainName: ChainName): ChainId {
  const chain = chains[chainName];
  if (!chain) {
    throw new Error(`Chain not found: ${chainName}`);
  }
  return chain.metadata.chainId;
}

/**
 * @title Get Chain Name by ID Function
 * @notice Returns the chain name for a given chain ID
 * @param chainId The chain ID
 * @returns The chain name
 * @throws Error if chain ID is not found
 */
export function getChainNameById(chainId: ChainId): ChainName {
  for (const [name, chain] of Object.entries(chains)) {
    if (chain.metadata.chainId === chainId) {
      return name as ChainName;
    }
  }
  throw new Error(`Chain ID not found: ${chainId}`);
}

/**
 * @title Validate Chain ID Function
 * @notice Checks if a chain ID is valid
 * @param chainId The chain ID to validate
 * @returns True if the chain ID is valid, false otherwise
 */
export function isValidChainId(chainId: number): boolean {
  try {
    getChainNameById(chainId);
    return true;
  } catch {
    return false;
  }
}

/**
 * @title Validate Chain Name Function
 * @notice Checks if a chain name is valid
 * @param chainName The chain name to validate
 * @returns True if the chain name is valid, false otherwise
 */
export function isValidChainName(chainName: string): chainName is ChainName {
  return chainName in chains;
}

/**
 * @title Get All Chain IDs Function
 * @notice Returns an array of all supported chain IDs
 * @returns Array of chain IDs
 */
export function getAllChainIds(): ChainId[] {
  return Object.values(chains).map((chain) => chain.metadata.chainId);
}

/**
 * @title Get All Chain Names Function
 * @notice Returns an array of all supported chain names
 * @returns Array of chain names
 */
export function getAllChainNames(): ChainName[] {
  return Object.keys(chains) as ChainName[];
}
