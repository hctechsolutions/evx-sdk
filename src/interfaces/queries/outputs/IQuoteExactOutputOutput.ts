export interface IQuoteExactOutputOutput {
  amountIn: bigint;
  sqrtPriceX96AfterList: bigint[];
  initializedTicksCrossedList: number[];
  gasEstimate: bigint;
}
