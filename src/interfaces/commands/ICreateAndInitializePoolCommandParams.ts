import { IBaseCommandParams } from "./IBaseCommand";

export interface ICreateAndInitializePoolCommandParams extends IBaseCommandParams {
  token0: string,
  token1: string,
  fee: number,
  initialPrice: number
}
