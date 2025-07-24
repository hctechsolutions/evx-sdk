/**
 * @title Gelato Task Output Interface
 * @notice Interface for Gelato task information
 */
export interface IGelatoTaskOutput {
  /** The task ID */
  taskId: string;
  /** The task name */
  name: string;
  /** The target contract address */
  target: string;
  /** The calldata to execute */
  data: string;
  /** The value to send with the transaction */
  value: bigint;
  /** The interval in seconds between executions */
  interval: number;
  /** The maximum number of executions */
  maxExecutions: number;
  /** The start time for the task (timestamp) */
  startTime: number;
  /** The end time for the task (timestamp) */
  endTime: number;
  /** The gas limit for the task */
  gasLimit: bigint;
  /** The maximum fee per gas */
  maxFeePerGas: bigint;
  /** The maximum priority fee per gas */
  maxPriorityFeePerGas: bigint;
  /** The task status */
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  /** The number of executions */
  executions: number;
  /** The last execution time */
  lastExecution?: number;
  /** The next execution time */
  nextExecution?: number;
  /** The task creator address */
  creator: string;
  /** The task creation time */
  createdAt: number;
} 