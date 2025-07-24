import { ILimitOrderCreatedEvent } from '@interfaces/events/limitOrder/ILimitOrderCreatedEvent';

/**
 * @title Get Limit Order Created Events Query Output Interface
 * @notice Interface for the output of limit order created events query
 */
export interface IGetLimitOrderCreatedEventsQueryOutput {
  /** Array of limit order created events */
  events: ILimitOrderCreatedEvent[];
  /** Total count of events returned */
  totalCount: number;
  /** The starting block number used in the query */
  fromBlock: number;
  /** The ending block number used in the query */
  toBlock: number | 'latest';
} 