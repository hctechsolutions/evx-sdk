import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for canceling an order
 * @dev Extends base command parameters with order cancellation specific parameters
 */
export interface ICancelOrderCommandParams extends IBaseCommandParams {
  orderId: bigint; // The ID of the order to cancel
}
