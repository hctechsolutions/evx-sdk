export interface IQuorumNumeratorUpdatedEvent {
  oldQuorumNumerator: bigint;
  newQuorumNumerator: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
