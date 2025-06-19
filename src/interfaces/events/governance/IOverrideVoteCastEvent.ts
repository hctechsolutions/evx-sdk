export interface IOverrideVoteCastEvent {
  voter: string;
  proposalId: bigint;
  support: number;
  weight: bigint;
  reason: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 