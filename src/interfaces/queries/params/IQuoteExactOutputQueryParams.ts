import { IBaseQueryParams } from '@interfaces';

export interface IQuoteExactOutputQueryParams extends IBaseQueryParams {
  path: string;
  amountOut: bigint;
}
