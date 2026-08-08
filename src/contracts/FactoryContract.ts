import FactoryABI from '@abis/Factory.json';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { BaseContract } from './BaseContract';
import { RPC } from '@providers';

/**
 * @title Factory Contract
 * @notice Contract wrapper for Evx Factory interactions
 * @dev Provides methods to interact with the factory contract for pool creation
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class FactoryContract extends BaseContract {
  /**
   * @notice Creates a new factory contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('factory', rpc, FactoryABI);
  }
}
