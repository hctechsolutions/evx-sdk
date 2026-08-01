import { ICreatePoolTokensParams } from './ICreatePoolTokensParams';
import { IInitializePoolCommandParams } from './IInitializePoolCommandParams';

/**
 * @notice Parameters for creating and initializing a pool via NPM helper
 * @dev Does NOT require feeMax/policyKeeper — NPM createAndInitializePoolIfNecessary
 *      remains a separate 4-arg surface until periphery is updated (deferred).
 */
export interface ICreateAndInitializePoolCommandParams
  extends IInitializePoolCommandParams,
    ICreatePoolTokensParams {}
