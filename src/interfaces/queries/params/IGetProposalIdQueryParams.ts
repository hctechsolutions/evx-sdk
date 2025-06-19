/**
 * @notice Parameters for the get proposal ID query
 * @dev Contains the proposal details to calculate the proposal ID
 */
export interface IGetProposalIdQueryParams {
  targets: string[]; // Array of target addresses for the proposal
  values: bigint[]; // Array of values to send with each call
  calldatas: string[]; // Array of calldata for each call
  descriptionHash: string; // Hash of the proposal description
}
