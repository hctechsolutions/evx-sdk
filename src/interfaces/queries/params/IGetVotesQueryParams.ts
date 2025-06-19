/**
 * @notice Parameters for the get votes query
 * @dev Contains the account address and block number to get voting power
 */
export interface IGetVotesQueryParams {
  account: string; // The account address to get voting power for
  blockNumber: bigint; // The block number to get voting power at
}
