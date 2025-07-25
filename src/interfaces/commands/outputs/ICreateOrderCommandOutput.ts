/**
 * @notice Output for creating an order
 * @dev Contains the order ID returned from the createOrder function and optional Gelato task info
 */
export interface ICreateOrderCommandOutput {
  orderId: bigint; // The ID of the created order
  gelatoTaskId?: string; // The ID of the created Gelato task (if applicable)
}
