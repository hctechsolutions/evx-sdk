export interface IProposalQueuedEvent {
  proposalId: bigint;
  etaSeconds: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 