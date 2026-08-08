import { BaseContract } from './BaseContract';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';
import TickLensABI from '@abis/TickLens.json';
import { RPC } from '@providers';

/**
 * @title Tick Lens Contract
 * @notice Contract for getting tick data from pools
 * @dev This contract is used to get tick data from pools
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class TickLensContract extends BaseContract {
  /**
   * @notice Creates a new Tick Lens contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('tickLens', rpc, TickLensABI);
  }
}
