export function decimalToSqrtX96Price(
  decimalPrice: number,
  decimalsToken0: number,
  decimalsToken1: number,
): bigint {
  // √(price01 * 10^(dec1-dec0))  *  2^96
  const factor = 10 ** (decimalsToken1 - decimalsToken0);
  const scaledPrice = decimalPrice * factor;

  const sqrtP = Math.sqrt(scaledPrice);
  const sqrtPriceX96 = sqrtP * 2 ** 96;

  return BigInt(Math.floor(sqrtPriceX96));
}

export function sqrtX96ToDecimalPrice(
  sqrtPriceX96: bigint | number,
  decimalsToken0: number,
  decimalsToken1: number,
): number {
  // (sqrtPriceX96 / 2**96) ** 2
  const sqrtPrice = sqrtPriceX96.toString();
  const sqrtPriceFloat = Number(sqrtPrice) / 2 ** 96;
  const price = sqrtPriceFloat ** 2;

  return price * 10 ** (decimalsToken0 - decimalsToken1);
}
