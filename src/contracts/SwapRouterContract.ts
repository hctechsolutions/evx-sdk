import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import SwapRouterABI from '../abis/SwapRouter.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title SwapRouter Contract
 * @notice Contract wrapper for the SwapRouter contract
 * @dev Extends BaseContract to provide swap functionality
 */
@injectable()
@singleton()
export class SwapRouterContract extends BaseContract {
  /**
   * @notice Creates a new SwapRouter contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('swapRouter', rpc, SwapRouterABI);
  }
}
