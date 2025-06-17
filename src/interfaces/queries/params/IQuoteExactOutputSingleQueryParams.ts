import { IBaseQueryParams } from '../IBaseQueryParams';

export interface IQuoteExactOutputSingleQueryParams extends IBaseQueryParams {
  tokenIn: string;
  tokenOut: string;
  amount: bigint;
  fee: bigint;
  sqrtPriceLimitX96?: bigint;
}
