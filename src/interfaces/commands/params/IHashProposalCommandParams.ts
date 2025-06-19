import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing a hash proposal operation
 * @dev Extends base command parameters with hash proposal specific parameters
 */
export interface IHashProposalCommandParams extends IBaseCommandParams {
  targets: string[]; // Array of target addresses for the proposal
  values: bigint[]; // Array of values to send with each call
  calldatas: string[]; // Array of calldata for each call
  descriptionHash: string; // Hash of the proposal description
}
