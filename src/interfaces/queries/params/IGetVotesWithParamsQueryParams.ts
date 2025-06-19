/**
 * @notice Parameters for the get votes with params query
 * @dev Contains the account address, timepoint and additional parameters to get voting power
 */
export interface IGetVotesWithParamsQueryParams {
  account: string; // The account address to get voting power for
  timepoint: bigint; // The timepoint to get voting power at
  params: string; // Additional parameters as bytes (hex string)
}
