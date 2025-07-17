/**
 * @title Limit Order Parameters Interface
 * @notice Interface for creating a limit order
 */
export interface ILimitOrderParams {
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
}
