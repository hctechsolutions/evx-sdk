import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for creating an order
 * @dev Extends base command parameters with order creation specific parameters
 */
export interface ICreateOrderCommandParams extends IBaseCommandParams {
  tokenIn: string; // The address of the input token
  tokenOut: string; // The address of the output token
  fee: number; // The fee tier of the pool
  recipient: string; // The address that will receive the output tokens
  deadline: number; // The deadline for the transaction
  amountIn: bigint; // The amount of input tokens to send
  amountOutMinimum: bigint; // The minimum amount of output tokens that must be received
  sqrtPriceLimitX96: bigint; // The price limit for the swap
}
