import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import GovernanceABI from '@abis/Governance.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title Governance Contract
 * @notice Contract wrapper for the Governance contract
 * @dev Extends BaseContract to provide governance functionality
 */
@injectable()
@singleton()
export class GovernanceContract extends BaseContract {
  /**
   * @notice Creates a new Governance contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('dao', rpc, GovernanceABI);
  }
}
