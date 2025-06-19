export interface IProposalExecutedEvent {
  proposalId: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 