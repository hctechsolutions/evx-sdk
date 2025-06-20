import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for updating the timelock address in governance
 * @dev Extends base command parameters with timelock specific parameters
 */
export interface IUpdateTimelockCommandParams extends IBaseCommandParams {
  newTimelock: string; // New timelock controller address
}
