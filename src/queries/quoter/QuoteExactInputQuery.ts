import { IQuoteExactInputQueryParams } from '@interfaces/queries/params/IQuoteExactInputQueryParams';
import { IQuoteExactInputOutput } from '@interfaces/queries/outputs/IQuoteExactInputOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { ErrorExtractor } from '@utils';

/**
 * @title Quote Exact Input Query
 * @notice Gets a quote for an exact input swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact input swap
 */
@injectable()
@singleton()
export class QuoteExactInputQuery
  implements IBaseQuery<IQuoteExactInputQueryParams, IQuoteExactInputOutput>
{
  constructor(
    @inject(ErrorExtractor)
    private readonly errorExtractor: ErrorExtractor,
    @inject(QuoterContract)
    private readonly quoter: QuoterContract
  ) {}

  /**
   * @notice Executes the quote exact input query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount out, price impact, and gas estimate
   * @throws Error with IContractError format if quote fails
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
