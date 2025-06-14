import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

export interface IMintCommandParams extends IBaseCommandParams {
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: BigNumberish;
  amount1Desired: BigNumberish;
  amount0Min: BigNumberish;
  amount1Min: BigNumberish;
  recipient: string;
  deadline: number;
} 