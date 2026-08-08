import { ethers, Signer } from 'ethers';
import PoolABI from '@abis/Pool.json';
import { container } from 'tsyringe';
import { RPC } from '@providers';

/**
 * @title Pool Contract
 * @notice Contract wrapper for Evx Pool interactions
 * @dev Provides methods to interact with a specific pool instance.
 *      Prefer passing an explicit {@link RPC} (scoped). Omitting `rpc` falls
 *      back to the root container (legacy single-consumer / Web).
 */
export class PoolContract {
  instance: ethers.Contract;
  rpc: RPC;
  address: string;

  /**
   * @notice Creates a new pool contract instance
   * @param address The address of the pool contract
   * @param rpc Optional RPC from an SdkScope; defaults to root container
   */
  constructor(address: string, rpc?: RPC) {
    this.address = address;
    this.rpc = rpc ?? container.resolve(RPC);
    this.instance = new ethers.Contract(this.address, PoolABI, this.rpc.provider);
  }

  /**
   * @notice Sets the signer for pool contract interactions
   * @param signer The signer to use for transactions
   */
  async setSigner(signer?: Signer | null): Promise<void> {
    if (!signer) {
      this.instance = new ethers.Contract(
        this.address,
        PoolABI,
        this.rpc.provider
      );

      return;
    }

    this.instance = new ethers.Contract(this.address, PoolABI, signer);
  }
}
