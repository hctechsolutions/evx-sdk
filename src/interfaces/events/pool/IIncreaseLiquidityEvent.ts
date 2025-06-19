export interface IIncreaseLiquidityEvent {
  tokenId: bigint;
  liquidity: bigint;
  amount0: bigint;
  amount1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 