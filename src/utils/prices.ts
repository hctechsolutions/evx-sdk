/**
 * @title Decimal to SqrtX96 Price
 * @notice Converts a decimal price to sqrt price in X96 format
 * @dev Used for Uniswap V3 price calculations
 * @param decimalPrice The price in decimal format
 * @param decimalsToken0 Number of decimals for token0
 * @param decimalsToken1 Number of decimals for token1
 * @returns The sqrt price in X96 format as a bigint
 */
export function decimalToSqrtX96Price(
  decimalPrice: number,
  decimalsToken0: number,
  decimalsToken1: number
): bigint {
  // √(price01 * 10^(dec1-dec0))  *  2^96
  const factor = 10 ** (decimalsToken1 - decimalsToken0);
  const scaledPrice = decimalPrice * factor;

  const sqrtP = Math.sqrt(scaledPrice);
  const sqrtPriceX96 = sqrtP * 2 ** 96;

  return BigInt(Math.floor(sqrtPriceX96));
}

/**
 * @title SqrtX96 to Decimal Price
 * @notice Converts a sqrt price in X96 format to decimal price
 * @dev Used for Uniswap V3 price calculations
 * @param sqrtPriceX96 The sqrt price in X96 format
 * @param decimalsToken0 Number of decimals for token0
 * @param decimalsToken1 Number of decimals for token1
 * @returns The price in decimal format
 */
export function sqrtX96ToDecimalPrice(
  sqrtPriceX96: bigint | number,
  decimalsToken0: number,
  decimalsToken1: number
): number {
  // (sqrtPriceX96 / 2**96) ** 2
  const sqrtPrice = sqrtPriceX96.toString();
  const sqrtPriceFloat = Number(sqrtPrice) / 2 ** 96;
  const price = sqrtPriceFloat ** 2;

  return price * 10 ** (decimalsToken0 - decimalsToken1);
}
