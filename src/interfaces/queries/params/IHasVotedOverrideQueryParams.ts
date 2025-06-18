/**
 * @notice Parameters for the has voted override query
 * @dev Contains the proposal ID and account address to check if the account has voted with override
 */
export interface IHasVotedOverrideQueryParams {
  proposalId: bigint; // The proposal ID to check override voting status for
  account: string; // The account address to check if they have voted with override
} 