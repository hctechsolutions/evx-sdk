import { IBaseQueryParams } from '@interfaces';

/**
 * @notice Parameters for getting the slot0 information of a pool
 * @dev Contains the pool address to query the current slot0 state
 */
export interface IGetSlot0QueryParams extends IBaseQueryParams {
  poolAddress: string; // The address of the pool to query
}
