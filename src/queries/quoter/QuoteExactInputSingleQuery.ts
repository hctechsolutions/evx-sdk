import { IQuoteExactInputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactInputSingleQueryParams';
import { IQuoteExactInputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactInputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Quote Exact Input Single Query
 * @notice Gets a quote for an exact input single swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact input single swap
 */
@injectable()
@singleton()
export class QuoteExactInputSingleQuery
  implements IBaseQuery<IQuoteExactInputSingleQueryParams, IQuoteExactInputSingleOutput>
{
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the quote exact input single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount out, price impact, and gas estimate
   */
  async execute(params: IQuoteExactInputSingleQueryParams): Promise<IQuoteExactInputSingleOutput> {
    const quoter = new QuoterContract(this.rpc);
    const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] =
      await quoter.instance.quoteExactInputSingle.staticCall({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee,
        amountIn: params.amountIn,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96
      });

    return {
      amountOut,
      sqrtPriceX96After,
      initializedTicksCrossed,
      gasEstimate
    };
  }
}
