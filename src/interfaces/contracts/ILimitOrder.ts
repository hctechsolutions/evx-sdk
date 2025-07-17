/**
 * @title Limit Order Interface
 * @notice Interface representing a limit order structure
 */
export interface ILimitOrder {
  /** The address of the user who created the order */
  user: string;
  /** The address of the input token */
  tokenIn: string;
  /** The address of the output token */
  tokenOut: string;
  /** The amount of input tokens */
  amountIn: bigint;
  /** The minimum amount of output tokens expected */
  minAmountOut: bigint;
  /** The fee tier for the swap */
  fee: number;
  /** The target price at which the order should execute */
  targetPrice: bigint;
  /** The deadline timestamp for the order */
  deadline: bigint;
  /** The sqrt price limit for the swap */
  sqrtPriceLimitX96: bigint;
  /** Whether the order is active */
  isActive: boolean;
  /** The Gelato task ID for automation */
  taskId: string;
}
