export interface ISwapEvent {
  sender: string;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  poolAddress?: string;
}
