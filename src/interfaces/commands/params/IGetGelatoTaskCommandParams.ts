import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @title Get Gelato Task Command Parameters Interface
 * @notice Interface for parameters needed to get a Gelato automation task
 */
export interface IGetGelatoTaskCommandParams extends IBaseCommandParams {
  /** The task ID to get */
  taskId: string;
  /** The Gelato API key */
  apiKey?: string;
} 