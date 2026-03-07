import { IQuoteExactOutputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactOutputSingleQueryParams';
import { IQuoteExactOutputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactOutputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';

/**
 * @title Quote Exact Output Single Query
 * @notice Gets a quote for an exact output single swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output single swap
 */
@injectable()
@singleton()
export class QuoteExactOutputSingleQuery
  implements IBaseQuery<IQuoteExactOutputSingleQueryParams, IQuoteExactOutputSingleOutput>
{
  constructor(
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact output single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   * @throws Error if quote fails (reverts from contract)
   */
  async execute(
    params: IQuoteExactOutputSingleQueryParams
  ): Promise<IQuoteExactOutputSingleOutput> {
    const [amountIn, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] =
      await this.quoter.instance.quoteExactOutputSingle.staticCall({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amount,
        fee: params.fee,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96 ?? 0n
      });

    return {
      amountIn,
      sqrtPriceX96After,
      initializedTicksCrossed,
      gasEstimate
    };
  }
}
