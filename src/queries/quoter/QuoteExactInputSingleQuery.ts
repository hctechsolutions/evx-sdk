import { IQuoteExactInputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactInputSingleQueryParams';
import { IQuoteExactInputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactInputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { ErrorExtractor } from '@utils';

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
    @inject(ErrorExtractor)
    private readonly errorExtractor: ErrorExtractor,
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact input single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount out, price impact, and gas estimate
   * @throws Error with IContractError format if quote fails
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
