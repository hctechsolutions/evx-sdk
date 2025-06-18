/**
 * @notice Result for the get proposal votes query
 * @dev Contains the votes breakdown for a proposal
 */
export interface IGetProposalVotesResult {
  againstVotes: bigint;
  forVotes: bigint;
  abstainVotes: bigint;
} 