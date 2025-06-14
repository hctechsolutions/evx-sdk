/**
 * @notice Parameters for executing a quote exact input single query
 * @dev Contains the parameters needed to get a quote for an exact input single swap
 */
export interface IQuoteExactInputSingleQueryParams {
  tokenIn: string;           // The address of the input token
  tokenOut: string;          // The address of the output token
  fee: bigint;               // The fee tier of the pool
  amountIn: bigint;          // The amount of input tokens to send
  sqrtPriceLimitX96: bigint; // The price limit for the swap
} 