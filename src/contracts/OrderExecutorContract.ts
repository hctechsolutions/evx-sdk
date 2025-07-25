import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import OrderExecutorABI from '@abis/OrderExecutor.json';
import { inject, injectable, singleton } from 'tsyringe';

/**
 * @title OrderExecutor Contract
 * @notice Contract wrapper for the OrderExecutor contract
 * @dev Extends BaseContract to provide order creation and execution functionality
 */
@injectable()
@singleton()
export class OrderExecutorContract extends BaseContract {
  /**
   * @notice Creates a new OrderExecutor contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('orderExecutor', rpc, OrderExecutorABI);
  }
}
