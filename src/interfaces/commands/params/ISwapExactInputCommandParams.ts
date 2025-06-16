import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing an exact input swap
 * @dev Extends base command parameters with swap specific parameters
 */
export interface ISwapExactInputCommandParams extends IBaseCommandParams {
  path: string; // The encoded swap path
  recipient: string; // The address that will receive the output tokens
  deadline: number; // The deadline for the transaction
  amountIn: bigint; // The amount of input tokens to send
  amountOutMinimum: bigint; // The minimum amount of output tokens that must be received
}
