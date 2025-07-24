import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @title Cancel Gelato Task Command Parameters Interface
 * @notice Interface for parameters needed to cancel a Gelato automation task
 */
export interface ICancelGelatoTaskCommandParams extends IBaseCommandParams {
  /** The task ID to cancel */
  taskId: string;
  /** The Gelato API key */
  apiKey?: string;
} 