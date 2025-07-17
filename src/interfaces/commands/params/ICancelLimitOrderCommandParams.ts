import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @title Cancel Limit Order Command Parameters Interface
 * @notice Interface for parameters needed to cancel a limit order
 */
export interface ICancelLimitOrderCommandParams extends IBaseCommandParams {
  /** The unique identifier of the limit order to cancel */
  orderId: string;
}
