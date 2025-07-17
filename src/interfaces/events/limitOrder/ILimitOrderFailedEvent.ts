/**
 * @title Limit Order Failed Event Interface
 * @notice Interface for the LimitOrderFailed event
 */
export interface ILimitOrderFailedEvent {
  /** The unique identifier for the limit order */
  orderId: string;
  /** The user who created the order */
  user: string;
  /** The reason for failure */
  reason: string;
  /** The block number of the event */
  blockNumber: number;
  /** The transaction hash */
  transactionHash: string;
  /** The log index */
  logIndex: number;
}
