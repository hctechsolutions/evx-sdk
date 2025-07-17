import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { ILimitOrder } from '@interfaces/contracts/ILimitOrder';

/**
 * @title Limit Order Queries
 * @notice Provides query methods for limit order data
 * @dev This class provides read-only methods to fetch limit order information
 */
@injectable()
@singleton()
export class LimitOrderQueries {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Gets a limit order by its ID
   * @param orderId The unique identifier of the limit order
   * @returns Promise resolving to the limit order data
   */
  async getLimitOrder(orderId: string): Promise<ILimitOrder> {
    const limitOrder = await this.limitOrderExecutor.instance.getLimitOrder(orderId);
    
    return {
      user: limitOrder.user,
      tokenIn: limitOrder.tokenIn,
      tokenOut: limitOrder.tokenOut,
      amountIn: limitOrder.amountIn,
      minAmountOut: limitOrder.minAmountOut,
      fee: limitOrder.fee,
      targetPrice: limitOrder.targetPrice,
      deadline: limitOrder.deadline,
      sqrtPriceLimitX96: limitOrder.sqrtPriceLimitX96,
      isActive: limitOrder.isActive,
      taskId: limitOrder.taskId
    };
  }

  /**
   * @notice Gets all order IDs for a specific user
   * @param userAddress The address of the user
   * @returns Promise resolving to an array of order IDs
   */
  async getUserOrders(userAddress: string): Promise<string[]> {
    return await this.limitOrderExecutor.instance.getUserOrders(userAddress);
  }

  /**
   * @notice Gets the current price for a token pair
   * @param tokenIn The input token address
   * @param tokenOut The output token address
   * @param fee The fee tier
   * @returns Promise resolving to the current price
   */
  async getCurrentPrice(tokenIn: string, tokenOut: string, fee: number): Promise<bigint> {
    return await this.limitOrderExecutor.instance.getCurrentPrice(tokenIn, tokenOut, fee);
  }

  /**
   * @notice Checks if a limit order can be executed
   * @param orderId The unique identifier of the limit order
   * @returns Promise resolving to execution status and payload
   */
  async canExecuteLimitOrder(orderId: string): Promise<{ canExec: boolean; execPayload: string }> {
    const [canExec, execPayload] = await this.limitOrderExecutor.instance.canExecuteLimitOrder(orderId);
    return { canExec, execPayload };
  }

  /**
   * @notice Gets multiple limit orders by their IDs
   * @param orderIds Array of order IDs to fetch
   * @returns Promise resolving to an array of limit orders
   */
  async getLimitOrders(orderIds: string[]): Promise<ILimitOrder[]> {
    const promises = orderIds.map(orderId => this.getLimitOrder(orderId));
    return Promise.all(promises);
  }

  /**
   * @notice Gets all active limit orders for a user
   * @param userAddress The address of the user
   * @returns Promise resolving to an array of active limit orders
   */
  async getActiveLimitOrders(userAddress: string): Promise<ILimitOrder[]> {
    const orderIds = await this.getUserOrders(userAddress);
    const orders = await this.getLimitOrders(orderIds);
    return orders.filter(order => order.isActive);
  }
}
