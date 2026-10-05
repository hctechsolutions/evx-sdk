import { IQuoteExactInputQueryParams } from '@interfaces/queries/params/IQuoteExactInputQueryParams';
import { IQuoteExactInputOutput } from '@interfaces/queries/outputs/IQuoteExactInputOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { rethrowQuoteError } from '@utils';

/**
 * @title Quote Exact Input Query
 * @notice Gets a quote for an exact input swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact input swap
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class QuoteExactInputQuery
  implements IBaseQuery<IQuoteExactInputQueryParams, IQuoteExactInputOutput>
{
  constructor(
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact input query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount out, price impact, and gas estimate
 * @throws QuoteSdkError with `code` when Quoter emits a typed custom error;
 * opaque / Panic reverts are rethrown without code
   */
  async execute(params: IQuoteExactInputQueryParams): Promise<IQuoteExactInputOutput> {
    try {
      const [amountOut, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] =
        await this.quoter.instance.quoteExactInput.staticCall(params.path, params.amountIn);

      return {
        amountOut,
        sqrtPriceX96AfterList,
        initializedTicksCrossedList,
        gasEstimate
      };
    } catch (err) {
      rethrowQuoteError(err);
    }
  }
}
