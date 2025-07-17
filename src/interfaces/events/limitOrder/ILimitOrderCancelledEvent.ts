/**
 * @title Limit Order Cancelled Event Interface
 * @notice Interface for the LimitOrderCancelled event
 */
export interface ILimitOrderCancelledEvent {
  /** The unique identifier for the limit order */
  orderId: string;
  /** The user who created the order */
  user: string;
  /** The block number of the event */
  blockNumber: number;
  /** The transaction hash */
  transactionHash: string;
  /** The log index */
  logIndex: number;
}
