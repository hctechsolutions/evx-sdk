import { IBaseCommandParams } from "./IBaseCommandParams"

export interface IInitializePoolCommandParams extends IBaseCommandParams {
  initialPrice: bigint
}

export interface IInitializeOnlyPoolCommandParams extends IInitializePoolCommandParams {
  poolAddress: string
}
