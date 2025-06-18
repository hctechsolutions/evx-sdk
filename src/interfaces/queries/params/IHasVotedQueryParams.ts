/**
 * @notice Parameters for the has voted query
 * @dev Contains the proposal ID and account address to check if the account has voted
 */
export interface IHasVotedQueryParams {
  proposalId: bigint; // The proposal ID to check voting status for
  account: string; // The account address to check if they have voted
} 