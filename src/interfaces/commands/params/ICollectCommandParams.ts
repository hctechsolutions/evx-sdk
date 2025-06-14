import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for collecting fees from a position
 * @dev Extends base command parameters with collect specific parameters
 */
export interface ICollectCommandParams extends IBaseCommandParams {
  /** The ID of the position to collect from */
  tokenId: BigNumberish;
  /** The address that will receive the collected fees */
  recipient: string;
  /** The maximum amount of token0 to collect */
  amount0Max: BigNumberish;
  /** The maximum amount of token1 to collect */
  amount1Max: BigNumberish;
} 