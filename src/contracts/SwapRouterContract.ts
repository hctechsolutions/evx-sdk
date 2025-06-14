import { BaseContract } from './BaseContract';
import { ContractName } from '@resources';
import { RPC } from '@providers';
import SwapRouterABI from '../abis/SwapRouter.json';

/**
 * @title SwapRouter Contract
 * @notice Contract wrapper for the SwapRouter contract
 * @dev Extends BaseContract to provide swap functionality
 */
export class SwapRouterContract extends BaseContract {
  /**
   * @notice Creates a new SwapRouter contract instance
   * @param rpc The RPC provider instance
   */
  constructor(rpc: RPC) {
    super('swapRouter', rpc, SwapRouterABI);
  }
} 