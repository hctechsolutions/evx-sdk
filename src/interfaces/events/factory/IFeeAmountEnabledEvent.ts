export interface IFeeAmountEnabledEvent {
  fee: bigint;
  tickSpacing: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
