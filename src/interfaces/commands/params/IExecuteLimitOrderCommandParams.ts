import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @title Execute Limit Order Command Parameters Interface
 * @notice Interface for parameters needed to manually execute a limit order
 */
export interface IExecuteLimitOrderCommandParams extends IBaseCommandParams {
  /** The unique identifier of the limit order to execute */
  orderId: string;
}
