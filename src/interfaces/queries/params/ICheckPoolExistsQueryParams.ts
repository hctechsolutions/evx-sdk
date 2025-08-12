import { IBaseQueryParams } from '@interfaces';

/**
 * @notice Parameters for checking if a pool exists
 * @dev Contains the token addresses and fee tier to check pool existence
 */
export interface ICheckPoolExistsQueryParams extends IBaseQueryParams {
  token0: string; // The address of the first token
  token1: string; // The address of the second token
  fee: bigint; // The fee tier of the pool
}
