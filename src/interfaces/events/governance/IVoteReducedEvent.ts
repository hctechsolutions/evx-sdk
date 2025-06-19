export interface IVoteReducedEvent {
  delegate: string;
  proposalId: bigint;
  support: number;
  weight: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 