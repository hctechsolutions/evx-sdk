import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing a queue operation on a governance proposal
 * @dev Extends base command parameters with queue specific parameters
 */
export interface IQueueCommandParams extends IBaseCommandParams {
  targets: string[]; // Array of target addresses for the proposal
  values: bigint[]; // Array of values (in wei) for each target
  calldatas: string[]; // Array of calldata for each target
  descriptionHash: string; // Hash of the proposal description (keccak256 of the proposal description)
}
