import { BigNumberish } from 'ethers';
import { IBaseCommandParams } from './IBaseCommandParams';

export interface IBurnCommandParams extends IBaseCommandParams {
  tokenId: BigNumberish;
} 