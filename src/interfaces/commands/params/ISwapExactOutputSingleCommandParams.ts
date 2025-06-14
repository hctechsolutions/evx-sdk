import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing an exact output single swap
 * @dev Extends base command parameters with swap specific parameters
 */
export interface ISwapExactOutputSingleCommandParams extends IBaseCommandParams {
  tokenIn: string;           // The address of the input token
  tokenOut: string;          // The address of the output token
  fee: number;               // The fee tier of the pool
  recipient: string;         // The address that will receive the output tokens
  deadline: number;          // The deadline for the transaction
  amountOut: bigint;         // The amount of output tokens to receive
  amountInMaximum: bigint;   // The maximum amount of input tokens that can be required
  sqrtPriceLimitX96: bigint; // The price limit for the swap
} 