import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing a propose operation on a governance proposal
 * @dev Extends base command parameters with propose specific parameters
 */
export interface IProposeCommandParams extends IBaseCommandParams {
  targets: string[]; // Array of target addresses for the proposal
  values: bigint[]; // Array of values (in wei) for each target
  calldatas: string[]; // Array of calldata for each target
  description: string; // Description of the proposal
} 