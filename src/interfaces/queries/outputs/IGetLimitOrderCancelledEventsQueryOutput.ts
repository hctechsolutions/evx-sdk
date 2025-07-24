import { ILimitOrderCancelledEvent } from '@interfaces/events/limitOrder/ILimitOrderCancelledEvent';

/**
 * @title Get Limit Order Cancelled Events Query Output Interface
 * @notice Interface for the output of limit order cancelled events query
 */
export interface IGetLimitOrderCancelledEventsQueryOutput {
  /** Array of limit order cancelled events */
  events: ILimitOrderCancelledEvent[];
  /** Total count of events returned */
  totalCount: number;
  /** The starting block number used in the query */
  fromBlock: number;
  /** The ending block number used in the query */
  toBlock: number | 'latest';
} 