import { IQuoteExactOutputQueryParams } from '@interfaces/queries/params/IQuoteExactOutputQueryParams';
import { IQuoteExactOutputOutput } from '@interfaces/queries/outputs/IQuoteExactOutputOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { ErrorExtractor } from '@utils';

/**
 * @title Quote Exact Output Query
 * @notice Gets a quote for an exact output swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output swap
 */
@injectable()
@singleton()
export class QuoteExactOutputQuery
  implements IBaseQuery<IQuoteExactOutputQueryParams, IQuoteExactOutputOutput>
{
  constructor(
    @inject(ErrorExtractor)
    private readonly errorExtractor: ErrorExtractor,
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact output query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   * @throws Error with IContractError format if quote fails
   */
  async execute(params: IQuoteExactOutputQueryParams): Promise<IQuoteExactOutputOutput> {
    try {
      const [amountIn, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] =
        await this.quoter.instance.quoteExactOutput.staticCall(params.path, params.amountOut);

      return {
        amountIn,
        sqrtPriceX96AfterList,
        initializedTicksCrossedList,
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
