export interface IProposalCreatedEvent {
  proposalId: bigint;
  proposer: string;
  targets: string[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
  voteStart: bigint;
  voteEnd: bigint;
  description: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
