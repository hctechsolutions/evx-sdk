export interface IFlashEvent {
  sender: string;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  paid0: bigint;
  paid1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
