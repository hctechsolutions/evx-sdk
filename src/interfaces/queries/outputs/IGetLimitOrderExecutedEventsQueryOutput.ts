import { ILimitOrderExecutedEvent } from '@interfaces/events/limitOrder/ILimitOrderExecutedEvent';

/**
 * @title Get Limit Order Executed Events Query Output Interface
 * @notice Interface for the output of limit order executed events query
 */
export interface IGetLimitOrderExecutedEventsQueryOutput {
  /** Array of limit order executed events */
  events: ILimitOrderExecutedEvent[];
  /** Total count of events returned */
  totalCount: number;
  /** The starting block number used in the query */
  fromBlock: number;
  /** The ending block number used in the query */
  toBlock: number | 'latest';
} 