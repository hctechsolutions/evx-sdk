export interface ICollectEvent {
  owner: string;
  recipient: string;
  tickLower: number;
  tickUpper: number;
  amount0: bigint;
  amount1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
