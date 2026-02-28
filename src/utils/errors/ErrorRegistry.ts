import NonfungiblePositionManagerABI from '@abis/NonfungiblePositionManager.json';
import GovernanceABI from '@abis/Governance.json';
import SwapRouterABI from '@abis/SwapRouter.json';
import { injectable, singleton } from 'tsyringe';
import FactoryABI from '@abis/Factory.json';
import QuoterABI from '@abis/Quoter.json';
import PoolABI from '@abis/Pool.json';
import { ethers } from 'ethers';

/**
 * @title Error Registry
 * @notice Consolidated registry of all custom errors from contract ABIs
 * @dev Maps error selectors (first 4 bytes of keccak256) to error names
 */
@injectable()
@singleton()
export class ErrorRegistry {
  private registry: Map<string, string> = new Map<string, string>();

  constructor() {
    this.initializeRegistry();
  }

  /**
   * @notice Initialize the registry by loading errors from all contract ABIs
   */
  private initializeRegistry(): void {
    const abis = [
      QuoterABI,
      PoolABI,
      FactoryABI,
      GovernanceABI,
      SwapRouterABI,
      NonfungiblePositionManagerABI
    ];

    abis.forEach((abi) => {
      try {
        const iface = new ethers.Interface(abi as ethers.InterfaceAbi);
        // Access errors through the errors property
        const errors = (iface as any).errors ?? {};
        Object.values(errors).forEach((error: any) => {
          if (error?.selector && error?.name) {
            const selector = error.selector;
            this.registry.set(selector, error.name);
          }
        });
      } catch {
        // Silently skip ABIs that fail to parse
        // This can happen if ABI format is invalid
      }
    });
  }

  /**
   * @notice Get error name by selector
   * @param selector Error selector (first 4 bytes in hex format, e.g., "0xc0046b6b")
   * @returns Error name if found, undefined otherwise
   */
  getErrorName(selector: string): string | undefined {
    return this.registry.get(selector);
  }

  /**
   * @notice Check if an error selector is registered
   * @param selector Error selector
   * @returns True if selector is registered, false otherwise
   */
  hasError(selector: string): boolean {
    return this.registry.has(selector);
  }

  /**
   * @notice Get all registered error selectors
   * @returns Array of all error selectors
   */
  getAllSelectors(): string[] {
    return Array.from(this.registry.keys());
  }
}
