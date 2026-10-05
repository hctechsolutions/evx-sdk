import { IQuoteExactInputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactInputSingleQueryParams';
import { IQuoteExactInputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactInputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { rethrowQuoteError } from '@utils';

/**
 * @title Quote Exact Input Single Query
 * @notice Gets a quote for an exact input single swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact input single swap
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class QuoteExactInputSingleQuery
  implements IBaseQuery<IQuoteExactInputSingleQueryParams, IQuoteExactInputSingleOutput>
{
  constructor(
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact input single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount out, price impact, and gas estimate
 * @throws QuoteSdkError with `code` when Quoter emits a typed custom error;
 * opaque / Panic reverts are rethrown without code
   */
  async execute(params: IQuoteExactInputSingleQueryParams): Promise<IQuoteExactInputSingleOutput> {
    try {
      const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] =
        await this.quoter.instance.quoteExactInputSingle.staticCall({
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
    } catch (err) {
      rethrowQuoteError(err);
    }
  }
}
