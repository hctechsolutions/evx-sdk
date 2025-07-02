export interface ICollectPositionEvent {
  tokenId: bigint;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
