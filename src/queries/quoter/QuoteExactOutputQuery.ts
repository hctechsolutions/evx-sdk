import { IQuoteExactOutputQueryParams } from '@interfaces/queries/params/IQuoteExactOutputQueryParams';
import { IQuoteExactOutputOutput } from '@interfaces/queries/outputs/IQuoteExactOutputOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Quote Exact Output Query
 * @notice Gets a quote for an exact output swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output swap
 */
@injectable()
@singleton()
export class QuoteExactOutputQuery implements IBaseQuery<IQuoteExactOutputQueryParams, IQuoteExactOutputOutput> {
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the quote exact output query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   */
  async execute(params: IQuoteExactOutputQueryParams): Promise<IQuoteExactOutputOutput> {
    const quoter = new QuoterContract(this.rpc);
    const [amountIn, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] = 
      await quoter.instance.quoteExactOutput.staticCall(params.path, params.amountOut);

    return {
      amountIn,
      sqrtPriceX96AfterList,
      initializedTicksCrossedList,
      gasEstimate
    };
  }
} 