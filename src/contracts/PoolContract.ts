import EvexPoolABI from '@abis/EvexPool.json';
import { ethers, Signer } from 'ethers';
import { container } from 'tsyringe';
import { RPC } from '@providers';

/**
 * @title Pool Contract
 * @notice Contract wrapper for Evex Pool interactions
 * @dev Provides methods to interact with a specific pool instance
 */
export class PoolContract {
  instance: ethers.Contract;
  rpc: RPC;
  address: string;

  /**
   * @notice Creates a new pool contract instance
   * @param address The address of the pool contract
   */
  constructor(address: string) {
    this.address = address;
    this.rpc = container.resolve(RPC);
    this.instance = new ethers.Contract(address, EvexPoolABI, this.rpc.provider);
  }

  /**
   * @notice Sets the signer for pool contract interactions
   * @param signer The signer to use for transactions
   */
  async setSigner(signer?: Signer | null): Promise<void> {
    if (!signer) {
      this.instance = new ethers.Contract(this.address, EvexPoolABI, this.rpc.provider);

      return;
    }

    this.instance = new ethers.Contract(this.address, EvexPoolABI, signer);
  }
}
