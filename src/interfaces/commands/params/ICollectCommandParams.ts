import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

export interface ICollectCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish;
  recipient: string;
  amount0Max: BigNumberish;
  amount1Max: BigNumberish;
} 