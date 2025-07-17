/**
 * @title Limit Order Executed Event Interface
 * @notice Interface for the LimitOrderExecuted event
 */
export interface ILimitOrderExecutedEvent {
  /** The unique identifier for the limit order */
  orderId: string;
  /** The user who created the order */
  user: string;
  /** The actual output amount received */
  amountOut: bigint;
  /** The execution price */
  executionPrice: bigint;
  /** The block number of the event */
  blockNumber: number;
  /** The transaction hash */
  transactionHash: string;
  /** The log index */
  logIndex: number;
}
