import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

export interface IDecreaseLiquidityCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish;
  liquidity: BigNumberish;
  amount0Min: BigNumberish;
  amount1Min: BigNumberish;
  deadline: number;
} 