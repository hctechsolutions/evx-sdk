import { IQuoteExactOutputSingleQueryParams } from '@interfaces/queries/params/IQuoteExactOutputSingleQueryParams';
import { IQuoteExactOutputSingleOutput } from '@interfaces/queries/outputs/IQuoteExactOutputSingleOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Quote Exact Output Single Query
 * @notice Gets a quote for an exact output single swap
 * @dev This query interacts with the QuoterContract to get a quote for an exact output single swap
 */
@injectable()
@singleton()
export class QuoteExactOutputSingleQuery implements IBaseQuery<IQuoteExactOutputSingleQueryParams, IQuoteExactOutputSingleOutput> {
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the quote exact output single query
   * @param params The parameters for getting the quote
   * @returns The quote data including amount in, price impact, and gas estimate
   */
  async execute(params: IQuoteExactOutputSingleQueryParams): Promise<IQuoteExactOutputSingleOutput> {
    const quoter = new QuoterContract(this.rpc);
    const [amountIn, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] = 
      await quoter.instance.quoteExactOutputSingle.staticCall({
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