/**
 * @notice Output for the quote exact input query
 * @dev Contains the quote data returned by the contract
 */
export interface IQuoteExactInputOutput {
  amountOut: bigint; // The amount of output tokens that would be received
  sqrtPriceX96AfterList: bigint[]; // The sqrt price after the swap for each hop
  initializedTicksCrossedList: number[]; // The number of initialized ticks crossed for each hop
  gasEstimate: bigint; // The estimated gas cost of the swap
}
