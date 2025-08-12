/**
 * @notice Output of the get slot0 query
 * @dev Contains the current slot0 state including sqrt price, tick, and observation data
 */
export interface IGetSlot0Output {
  sqrtPriceX96: bigint; // The current sqrt price in X96 format
  tick: number; // The current tick
  observationIndex: number; // The current observation index
  observationCardinality: number; // The current observation cardinality
  observationCardinalityNext: number; // The next observation cardinality
  feeProtocol: number; // The current fee protocol
  unlocked: boolean; // Whether the pool is unlocked
}
