export interface IProposalCanceledEvent {
  proposalId: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 