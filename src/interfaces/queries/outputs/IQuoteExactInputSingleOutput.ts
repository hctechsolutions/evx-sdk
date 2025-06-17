/**
 * @notice Output for the quote exact input single query
 * @dev Contains the quote data returned by the contract
 */
export interface IQuoteExactInputSingleOutput {
  amountOut: bigint; // The amount of output tokens that would be received
  sqrtPriceX96After: bigint; // The sqrt price after the swap
  initializedTicksCrossed: number; // The number of initialized ticks crossed
  gasEstimate: bigint; // The estimated gas cost of the swap
}
