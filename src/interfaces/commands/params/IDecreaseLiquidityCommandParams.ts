import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for decreasing liquidity in a position
 * @dev Extends base command parameters with liquidity decrease specific parameters
 */
export interface IDecreaseLiquidityCommandParams extends IBaseCommandParams {
  /** The ID of the position to decrease liquidity from */
  tokenId: BigNumberish;
  /** The amount of liquidity to remove */
  liquidity: BigNumberish;
  /** The minimum amount of token0 to receive */
  amount0Min: BigNumberish;
  /** The minimum amount of token1 to receive */
  amount1Min: BigNumberish;
  /** The deadline for the transaction */
  deadline: number;
} 