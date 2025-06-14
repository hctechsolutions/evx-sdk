import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for burning a position
 * @dev Extends base command parameters with burn specific parameters
 */
export interface IBurnCommandParams extends IBaseCommandParams {
  /** The ID of the position to burn */
  tokenId: BigNumberish;
} 