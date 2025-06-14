import { IBaseQueryParams } from "../IBaseQueryParams";

export interface IQuoteExactOutputQueryParams extends IBaseQueryParams {
  path: string;
  amountOut: bigint;
} 