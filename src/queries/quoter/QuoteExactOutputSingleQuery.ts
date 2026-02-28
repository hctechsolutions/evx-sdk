import { IQuoteExactOutputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactOutputSingleQueryParams';
import { IQuoteExactOutputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactOutputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { ErrorExtractor } from '@utils';

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
    @inject(ErrorExtractor)
    private readonly errorExtractor: ErrorExtractor,
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact output single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   * @throws Error with IContractError format if quote fails
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
    } catch (error: unknown) {
      // Quoter static calls are designed to revert intentionally
      // If the revert contains 96 bytes, it's valid quote data (handled by ethers.js)
      // Otherwise, it's a real error that needs to be extracted

      // Extract the contract error
      const contractError = this.errorExtractor.extractContractError(
        error,
        this.quoter.instance.interface
      );

      // Create enhanced error with contract error information
      const enhancedError = new Error(
        `Quote failed: ${contractError.errorMessage} (${contractError.errorCode})`
      );

      // Attach contract error to the error object
      (enhancedError as any).contractError = contractError;

      throw enhancedError;
    }
  }
}
