import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Shared token pair + fee tier fields for pool creation flows
 * @dev Used by CreatePool and CreateAndInitialize without forcing feeMax/policyKeeper
 */
export interface ICreatePoolTokensParams extends IBaseCommandParams {
  token0: string; // The address of the first token in the pool
  token1: string; // The address of the second token in the pool
  fee: bigint; // The fee tier for the pool
}
