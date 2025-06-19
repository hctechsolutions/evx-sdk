/**
 * @notice Parameters for the get quorum numerator query
 * @dev Contains an optional timepoint parameter for the quorum numerator calculation
 */
export interface IGetQuorumNumeratorQueryParams {
  timepoint?: bigint; // Optional timepoint for the quorum numerator calculation
}
