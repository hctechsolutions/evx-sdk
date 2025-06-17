/**
 * @notice Parameters for executing a quote exact input query
 * @dev Contains the parameters needed to get a quote for an exact input swap
 */
export interface IQuoteExactInputQueryParams {
  path: string; // The encoded swap path
  amountIn: bigint; // The amount of input tokens to send
}
