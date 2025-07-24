import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @title Create Gelato Task Command Parameters Interface
 * @notice Interface for parameters needed to create a Gelato automation task
 */
export interface ICreateGelatoTaskCommandParams extends IBaseCommandParams {
  /** The target contract address to execute */
  target: string;
  /** The calldata to execute */
  data: string;
  /** The value to send with the transaction */
  value?: bigint;
  /** The interval in seconds between executions */
  interval: number;
  /** The maximum number of executions */
  maxExecutions?: number;
  /** The start time for the task (timestamp) */
  startTime?: number;
  /** The end time for the task (timestamp) */
  endTime?: number;
  /** The gas limit for the task */
  gasLimit?: bigint;
  /** The maximum fee per gas */
  maxFeePerGas?: bigint;
  /** The maximum priority fee per gas */
  maxPriorityFeePerGas?: bigint;
  /** The name of the task */
  name?: string;
  /** The Gelato API key */
  apiKey?: string;
} 