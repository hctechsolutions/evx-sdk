import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing an exact output swap
 * @dev Extends base command parameters with swap specific parameters
 */
export interface ISwapExactOutputCommandParams extends IBaseCommandParams {
  path: string;              // The encoded swap path
  recipient: string;         // The address that will receive the output tokens
  deadline: number;          // The deadline for the transaction
  amountOut: bigint;         // The amount of output tokens to receive
  amountInMaximum: bigint;   // The maximum amount of input tokens that can be required
} 