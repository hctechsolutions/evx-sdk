import { IBaseCommandParams } from "./IBaseCommandParams"
import { Signer } from "ethers";

export interface IInitializePoolCommandParams extends IBaseCommandParams {
  initialPrice: bigint
}

export interface IInitializeOnlyPoolCommandParams extends IInitializePoolCommandParams {
  poolAddress: string;
  signer: Signer;
}
