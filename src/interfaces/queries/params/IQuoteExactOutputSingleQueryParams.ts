import { IBaseQueryParams } from '@interfaces';

export interface IQuoteExactOutputSingleQueryParams extends IBaseQueryParams {
  tokenIn: string;
  tokenOut: string;
  amount: bigint;
  fee: bigint;
  sqrtPriceLimitX96?: bigint;
}
