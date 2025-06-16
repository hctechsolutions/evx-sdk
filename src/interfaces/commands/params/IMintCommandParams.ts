import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for minting a new position
 * @dev Extends base command parameters with minting specific parameters
 */
export interface IMintCommandParams extends IBaseCommandParams {
  token0: string; // The address of the first token
  token1: string; // The address of the second token
  fee: number; // The fee tier of the pool
  tickLower: number; // The lower tick boundary of the position
  tickUpper: number; // The upper tick boundary of the position
  amount0Desired: BigNumberish; // The desired amount of token0 to add
  amount1Desired: BigNumberish; // The desired amount of token1 to add
  amount0Min: BigNumberish; // The minimum amount of token0 to add
  amount1Min: BigNumberish; // The minimum amount of token1 to add
  recipient: string; // The address that will receive the position
  deadline: number; // The deadline for the transaction
}
