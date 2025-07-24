import { IBaseQueryParams } from '@interfaces/queries/IBaseQueryParams';

/**
 * @title Get Limit Order Executed Events Query Parameters Interface
 * @notice Interface for querying limit order executed events
 */
export interface IGetLimitOrderExecutedEventsQueryParams extends IBaseQueryParams {
  /** The user address to filter events (optional) */
  user?: string;
  /** The starting block number for the query */
  fromBlock: number;
  /** The ending block number for the query (optional, defaults to 'latest') */
  toBlock?: number | 'latest';
} 