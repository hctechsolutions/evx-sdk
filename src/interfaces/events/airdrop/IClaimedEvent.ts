export interface IClaimedEvent {
  index: bigint;
  account: string;
  amount: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
