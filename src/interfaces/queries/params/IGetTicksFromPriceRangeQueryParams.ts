import { IBaseQueryParams } from '@interfaces';

/**
 * @notice Parameters for the get ticks from price range query
 * @dev Contains the pool address and sqrt prices in X96 format to convert to ticks
 */
export interface IGetTicksFromPriceRangeQueryParams extends IBaseQueryParams {
  pool: string; // The address of the Evx pool
  sqrtPriceLowerX96: bigint; // The lower sqrt price in X96 format
  sqrtPriceUpperX96: bigint; // The upper sqrt price in X96 format
}
