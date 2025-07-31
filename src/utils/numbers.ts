import { parseUnits, formatUnits } from 'ethers';

/**
 * @notice Converts a decimal number to a BigInt representation using fixed-point arithmetic.
 * @dev Useful for on-chain values (e.g., ERC20 with 18 decimals).
 * @param value The decimal number to convert (as number or string).
 * @param decimals The number of decimal places (commonly 18).
 * @return The BigInt representation.
 */
export function decimalToBigInt(value: string | number, decimals = 18): bigint {
  return parseUnits(value.toString(), decimals);
}

/**
 * @notice Converts a BigInt value (like on-chain token amount) to a human-readable decimal string.
 * @dev Reverts the transformation made by `decimalToBigInt`.
 * @param value The BigInt value to convert.
 * @param decimals The number of decimal places (commonly 18).
 * @return The decimal value as a string.
 */
export function bigIntToDecimal(value: bigint, decimals = 18): string {
  return formatUnits(value, decimals);
}
