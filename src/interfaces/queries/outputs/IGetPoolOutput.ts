/**
 * @notice Output of the get pool query
 * @dev Contains pool information including token addresses, fee tier, and configuration
 */
export interface IGetPoolOutput {
  token0: string; // The address of the first token
  token1: string; // The address of the second token
  feeTier: bigint; // The fee tier of the pool
  tickSpacing: bigint; // The tick spacing of the pool
  maxLiquidityPerTick: bigint; // The maximum liquidity per tick of the pool
}
