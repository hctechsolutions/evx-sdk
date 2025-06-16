import { ICreatePoolCommandParams } from './ICreatePoolCommandParams';
import { IInitializePoolCommandParams } from './IInitializePoolCommandParams';

/**
 * @notice Parameters for creating and initializing a pool
 * @dev Combines pool creation and initialization parameters
 */
export interface ICreateAndInitializePoolCommandParams
  extends IInitializePoolCommandParams,
    ICreatePoolCommandParams {}
