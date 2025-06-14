import { IRPC } from '@interfaces/providers/IRPC';
import { JsonRpcProvider } from 'ethers';
import { singleton } from 'tsyringe';

/**
 * @title RPC Provider
 * @notice Manages the RPC connection for the SDK
 * @dev Provides a singleton instance of JsonRpcProvider for blockchain interactions
 */
@singleton()
export class RPC implements IRPC {
  provider: JsonRpcProvider | null;

  /**
   * @notice Creates a new RPC provider instance
   * @dev Initializes with a default localhost provider
   */
  constructor() {
    this.provider = new JsonRpcProvider('::1');
  }

  /**
   * @notice Sets a new RPC provider URL
   * @param newRPC The new RPC URL to connect to
   */
  setProvider(newRPC: string) {
    this.provider = new JsonRpcProvider(newRPC);
  }
}
