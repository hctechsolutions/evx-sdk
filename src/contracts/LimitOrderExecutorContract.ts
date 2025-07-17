import { BaseContract } from './BaseContract';
import { injectable, inject, singleton } from 'tsyringe';
import LimitOrderExecutorABI from '@abis/LimitOrderExecutor.json';
import { RPC } from '@providers';

/**
 * @title Limit Order Executor Contract
 * @notice Contract wrapper for Limit Order Executor interactions with Gelato Network
 * @dev Provides methods to interact with the limit order executor contract for automated limit orders
 */
@injectable()
@singleton()
export class LimitOrderExecutorContract extends BaseContract {
  /**
   * @notice Creates a new limit order executor contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('limitOrderExecutor', rpc, LimitOrderExecutorABI);
  }
}
