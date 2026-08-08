import { IQuoteExactOutputQueryParams } from '@interfaces/queries/params/IQuoteExactOutputQueryParams';
import { IQuoteExactOutputOutput } from '@interfaces/queries/outputs/IQuoteExactOutputOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { QuoterContract } from '@contracts';

/**
 * @title Quote Exact Output Query
 * @notice Gets a quote for an exact output swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output swap
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class QuoteExactOutputQuery
  implements IBaseQuery<IQuoteExactOutputQueryParams, IQuoteExactOutputOutput>
{
  constructor(
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact output query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   * @throws Error if quote fails (reverts from contract)
   */
  async execute(params: IQuoteExactOutputQueryParams): Promise<IQuoteExactOutputOutput> {
    const [amountIn, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] =
      await this.quoter.instance.quoteExactOutput.staticCall(params.path, params.amountOut);

    return {
      amountIn,
      sqrtPriceX96AfterList,
      initializedTicksCrossedList,
      gasEstimate
    };
  }
}
