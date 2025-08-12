import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import EvxGovernanceABI from '@abis/EvxGovernance.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title EvxGovernance Contract
 * @notice Contract wrapper for the EvxGovernance contract
 * @dev Extends BaseContract to provide governance functionality
 */
@injectable()
@singleton()
export class EvxGovernanceContract extends BaseContract {
  /**
   * @notice Creates a new EvxGovernance contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('dao', rpc, EvxGovernanceABI);
  }
}
