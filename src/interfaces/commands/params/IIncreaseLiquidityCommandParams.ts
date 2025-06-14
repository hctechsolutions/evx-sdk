import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

export interface IIncreaseLiquidityCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish;
  amount0Desired: BigNumberish;
  amount1Desired: BigNumberish;
  amount0Min: BigNumberish;
  amount1Min: BigNumberish;
  deadline: number;
} 