import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for decreasing liquidity in a position
 * @dev Extends base command parameters with liquidity decrease specific parameters
 */
export interface IDecreaseLiquidityCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish; // The ID of the position to decrease liquidity from
  liquidity: BigNumberish; // The amount of liquidity to remove
  amount0Min: BigNumberish; // The minimum amount of token0 to receive
  amount1Min: BigNumberish; // The minimum amount of token1 to receive
  deadline: number; // The deadline for the transaction
} 