import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for executing a relay operation in governance
 * @dev Extends base command parameters with relay specific parameters
 */
export interface IRelayCommandParams extends IBaseCommandParams {
  target: string; // Target address for the relay call
  value: bigint; // Value to send with the relay call (in wei)
  data: string; // Calldata for the relay call
}
