/**
 * @notice Converts a percentage value to basis points (BPS).
 * @dev 1 BPS = 0.01%, 100 BPS = 1%, 10000 BPS = 100%
 * @param percentage The percentage value (e.g., 0.3 for 0.3%).
 * @return The basis points as a BigInt.
 */
export function percentageToBasisPoints(percentage: number): bigint {
  // Convert percentage to basis points (1% = 100 BPS)
  return BigInt(Math.round(percentage * 100));
}

/**
 * @notice Converts basis points (BPS) to a percentage value.
 * @dev 1 BPS = 0.01%, 100 BPS = 1%, 10000 BPS = 100%
 * @param basisPoints The basis points value.
 * @return The percentage as a number.
 */
export function basisPointsToPercentage(basisPoints: bigint): number {
  return Number(basisPoints) / 100;
}

/**
 * @notice Converts a percentage value to Evx fee format.
 * @dev Evx uses 1 unit = 0.0001%
 * @param percentage The percentage value (e.g., 0.3 for 0.3%).
 * @return The fee value as a BigInt.
 */
export function percentageToFee(percentage: number): bigint {
  // Convert percentage to Evx fee units (1 unit = 0.0001%)
  return BigInt(Math.round(percentage * 10000));
}

/**
 * @notice Converts Evx fee format to a percentage value.
 * @dev Evx uses 1 unit = 0.0001%
 * @param fee The fee value from Evx.
 * @return The percentage as a number.
 */
export function feeToPercentage(fee: bigint): number {
  return Number(fee) / 10000;
}

/**
 * @notice Converts basis points to Evx fee format.
 * @dev 1 BPS = 0.01% = 100 Evx units
 * @param basisPoints The basis points value.
 * @return The Evx fee value as a BigInt.
 */
export function basisPointsToFee(basisPoints: bigint): bigint {
  return basisPoints * 100n;
}

/**
 * @notice Converts Evx fee format to basis points.
 * @dev 1 Evx unit = 0.0001% = 0.01 BPS
 * @param fee The Evx fee value.
 * @return The basis points as a BigInt.
 */
export function feeToBasisPoints(fee: bigint): bigint {
  return fee / 100n;
}
