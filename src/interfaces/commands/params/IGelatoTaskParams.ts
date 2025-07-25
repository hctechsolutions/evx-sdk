/**
 * @notice Parameters for creating a Gelato task
 * @dev Contains the necessary parameters to create an automated task
 */
export interface IGelatoTaskParams {
  name: string; // Name of the task
  execAddress: string; // Address of the contract to execute
  execSelector: string; // Function selector to execute
  execData: string; // Encoded function data
  interval: number; // Interval in seconds between executions
  startTime?: number; // Optional start time (timestamp)
  useTreasury?: boolean; // Whether to use Gelato treasury for gas
  dedicatedMsgSender?: boolean; // Whether to use dedicated message sender
}
