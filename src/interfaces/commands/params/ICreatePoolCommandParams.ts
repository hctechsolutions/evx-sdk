import { ICreatePoolTokensParams } from './ICreatePoolTokensParams';

/**
 * @notice Parameters for creating a new pool via EvxFactory.createPool
 * @dev Includes feeMax and policyKeeper required by the Story 1.2 factory signature
 */
export interface ICreatePoolCommandParams extends ICreatePoolTokensParams {
  feeMax: bigint; // Maximum swap fee allowed via setDynamicFee
  policyKeeper: string; // Address authorized to call setDynamicFee
}
