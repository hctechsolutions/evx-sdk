import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import EvexGovernanceABI from '@abis/EvexGovernance.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title EvexGovernance Contract
 * @notice Contract wrapper for the EvexGovernance contract
 * @dev Extends BaseContract to provide governance functionality
 */
@injectable()
@singleton()
export class EvexGovernanceContract extends BaseContract {
  /**
   * @notice Creates a new EvexGovernance contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('dao', rpc, EvexGovernanceABI);
  }
}
