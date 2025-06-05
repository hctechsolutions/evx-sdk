import { IBaseCommandParams } from "./IBaseCommandParams";

export interface ICreatePoolCommandParams extends IBaseCommandParams {
  token0: string,
  token1: string,
  fee: bigint,
}
