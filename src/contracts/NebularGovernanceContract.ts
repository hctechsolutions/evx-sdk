import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import NebularGovernanceABI from '@abis/NebularGovernance.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title NebularGovernance Contract
 * @notice Contract wrapper for the NebularGovernance contract
 * @dev Extends BaseContract to provide governance functionality
 */
@injectable()
@singleton()
export class NebularGovernanceContract extends BaseContract {
  /**
   * @notice Creates a new NebularGovernance contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('dao', rpc, NebularGovernanceABI);
  }
}
