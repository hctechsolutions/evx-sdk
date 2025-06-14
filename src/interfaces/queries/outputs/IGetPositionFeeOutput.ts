/**
 * @notice Output for the get position fee query
 * @dev Contains the fees owed for both tokens in the position
 */
export interface IGetPositionFeeOutput {
  owed0: bigint; // The amount of token0 fees owed
  owed1: bigint; // The amount of token1 fees owed
}