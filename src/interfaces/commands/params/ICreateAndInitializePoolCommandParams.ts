import { ICreatePoolCommandParams } from "./ICreatePoolCommandParams";
import { IInitializePoolCommandParams } from "./IInitializePoolCommandParams";

export interface ICreateAndInitializePoolCommandParams
  extends IInitializePoolCommandParams, ICreatePoolCommandParams {}
