export interface IVoteCastWithParamsEvent {
  voter: string;
  proposalId: bigint;
  support: number;
  weight: bigint;
  reason: string;
  params: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 