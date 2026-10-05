import { IRPC } from '@interfaces/providers/IRPC';
import { JsonRpcProvider } from 'ethers';
import { scoped, Lifecycle } from 'tsyringe';

/**
 * @title RPC Provider
 * @notice Manages the RPC connection for the SDK
 * @dev ContainerScoped — one instance per DI scope
 */
@scoped(Lifecycle.ContainerScoped)
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
    this.destroyProvider();
    this.provider = new JsonRpcProvider(newRPC);
  }

  /**
   * @notice Tears down the current JsonRpcProvider (sockets/timers)
   */
  destroyProvider(): void {
    if (this.provider && typeof this.provider.destroy === 'function') {
      this.provider.destroy();
    }
    this.provider = null;
  }
}
