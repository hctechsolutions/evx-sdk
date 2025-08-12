/**
 * @notice Output of the get ticks from price range query
 * @dev Contains the calculated tick lower and tick upper values from the price range
 */
export interface IGetTicksFromPriceRangeOutput {
  tickLower: number; // The calculated tick lower value
  tickUpper: number; // The calculated tick upper value
}
