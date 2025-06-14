import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for minting a new position
 * @dev Extends base command parameters with minting specific parameters
 */
export interface IMintCommandParams extends IBaseCommandParams {
  /** The address of the first token */
  token0: string;
  /** The address of the second token */
  token1: string;
  /** The fee tier of the pool */
  fee: number;
  /** The lower tick boundary of the position */
  tickLower: number;
  /** The upper tick boundary of the position */
  tickUpper: number;
  /** The desired amount of token0 to add */
  amount0Desired: BigNumberish;
  /** The desired amount of token1 to add */
  amount1Desired: BigNumberish;
  /** The minimum amount of token0 to add */
  amount0Min: BigNumberish;
  /** The minimum amount of token1 to add */
  amount1Min: BigNumberish;
  /** The address that will receive the position */
  recipient: string;
  /** The deadline for the transaction */
  deadline: number;
} 