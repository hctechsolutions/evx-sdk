import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for increasing liquidity in a position
 * @dev Extends base command parameters with liquidity increase specific parameters
 */
export interface IIncreaseLiquidityCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish; // The ID of the position to increase liquidity for
  amount0Desired: BigNumberish; // The desired amount of token0 to add
  amount1Desired: BigNumberish; // The desired amount of token1 to add
  amount0Min: BigNumberish; // The minimum amount of token0 to add
  amount1Min: BigNumberish; // The minimum amount of token1 to add
  deadline: number; // The deadline for the transaction
}
