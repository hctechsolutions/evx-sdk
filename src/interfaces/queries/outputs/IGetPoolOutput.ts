export interface IGetPoolOutput {
  token0: string;
  token1: string;
  feeTier: bigint;
  tickSpacing: bigint;
  maxLiquidityPerTick: bigint
}
