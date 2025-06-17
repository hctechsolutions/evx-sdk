import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for collecting fees from a position
 * @dev Extends base command parameters with collect specific parameters
 */
export interface ICollectCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish; // The ID of the position to collect from
  recipient: string; // The address that will receive the collected fees
  amount0Max: BigNumberish; // The maximum amount of token0 to collect
  amount1Max: BigNumberish; // The maximum amount of token1 to collect
}
