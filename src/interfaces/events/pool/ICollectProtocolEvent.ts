export interface ICollectProtocolEvent {
  sender: string;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 