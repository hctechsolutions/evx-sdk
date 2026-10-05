import { IQuoteExactOutputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactOutputSingleQueryParams';
import { IQuoteExactOutputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactOutputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { rethrowQuoteError } from '@utils';

/**
 * @title Quote Exact Output Single Query
 * @notice Gets a quote for an exact output single swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output single swap
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
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
 * @throws QuoteSdkError with `code` when Quoter emits a typed custom error;
 * opaque / Panic reverts are rethrown without code
   */
  async execute(
    params: IQuoteExactOutputSingleQueryParams
  ): Promise<IQuoteExactOutputSingleOutput> {
    try {
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
    } catch (err) {
      rethrowQuoteError(err);
    }
  }
}
