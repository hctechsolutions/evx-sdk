import { JsonRpcProvider } from 'ethers';

/**
 * @title RPC Provider Interface
 * @notice Interface for RPC provider management
 * @dev Defines the contract for RPC provider implementations
 */
export interface IRPC {
  /** The current RPC provider instance */
  provider: JsonRpcProvider | null;
  
  /**
   * @notice Sets a new RPC provider URL
   * @param newRPC The new RPC URL to connect to
   */
  setProvider(newRPC: string): void
}
