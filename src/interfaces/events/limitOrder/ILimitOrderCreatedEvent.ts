/**
 * @title Limit Order Created Event Interface
 * @notice Interface for the LimitOrderCreated event
 */
export interface ILimitOrderCreatedEvent {
  /** The unique identifier for the limit order */
  orderId: string;
  /** The user who created the order */
  user: string;
  /** The input token address */
  tokenIn: string;
  /** The output token address */
  tokenOut: string;
  /** The input amount */
  amountIn: bigint;
  /** The minimum output amount */
  minAmountOut: bigint;
  /** The fee tier */
  fee: number;
  /** The target price */
  targetPrice: bigint;
  /** The deadline timestamp */
  deadline: bigint;
  /** The Gelato task ID */
  taskId: string;
  /** The block number of the event */
  blockNumber: number;
  /** The transaction hash */
  transactionHash: string;
  /** The log index */
  logIndex: number;
}
