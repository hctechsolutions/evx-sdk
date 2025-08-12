import PositionManagerABI from '@abis/NonfungiblePositionManager.json';
import { injectable, inject, singleton } from 'tsyringe';
import { BaseContract } from './BaseContract';
import { RPC } from '@providers';

/**
 * @title Position Manager Contract
 * @notice Contract wrapper for Evx Position Manager interactions
 * @dev Provides methods to interact with the position manager contract for position management
 */
@injectable()
@singleton()
export class PositionManagerContract extends BaseContract {
  /**
   * @notice Creates a new position manager contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('positionManager', rpc, PositionManagerABI);
  }
}
