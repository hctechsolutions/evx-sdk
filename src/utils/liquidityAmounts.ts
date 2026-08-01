import { Q96 } from '@resources';

/**
 * @title LiquidityAmounts (low-level, contract-aligned)
 * @notice Primitives that mirror Evx LiquidityAmounts.sol: bigint in/out, Q64.96 sqrt prices.
 * @description
 * Use these when you need amounts that match exactly what the contract will use (e.g. deriving
 * amount1 from amount0 in the create-position form). For USD-based "total value" calculations
 * see `liquidity.ts` (calculateAmountsForPosition).
 */

/**
 * FullMath.mulDiv equivalent: (a * b) / c, floor division.
 * Used to mirror Solidity LiquidityAmounts precision.
 */
function mulDiv(a: bigint, b: bigint, c: bigint): bigint {
  if (c === 0n) return 0n;
  return (a * b) / c;
}

/**
 * @notice Get liquidity for a given amount of token0 (Uniswap V3 / Evx formula).
 * L = amount0 * sqrtA * sqrtB / (sqrtB - sqrtA)
 */
export function getLiquidityForAmount0(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount0: bigint
): bigint {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];
  const intermediate = mulDiv(sa, sb, Q96);
  return mulDiv(amount0, intermediate, sb - sa);
}

/**
 * @notice Get liquidity for a given amount of token1.
 * L = amount1 * Q96 / (sqrtB - sqrtA)
 */
export function getLiquidityForAmount1(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount1: bigint
): bigint {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];
  return mulDiv(amount1, Q96, sb - sa);
}

/**
 * @notice Get the maximum liquidity for given amounts (mirrors LiquidityAmounts.getLiquidityForAmounts).
 * When price is in range: L = min(L0, L1).
 */
export function getLiquidityForAmounts(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount0: bigint,
  amount1: bigint
): bigint {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];

  if (sqrtRatioX96 <= sa) {
    return getLiquidityForAmount0(sa, sb, amount0);
  }
  if (sqrtRatioX96 >= sb) {
    return getLiquidityForAmount1(sa, sb, amount1);
  }
  const liquidity0 = getLiquidityForAmount0(sqrtRatioX96, sb, amount0);
  const liquidity1 = getLiquidityForAmount1(sa, sqrtRatioX96, amount1);
  return liquidity0 < liquidity1 ? liquidity0 : liquidity1;
}

/** FixedPoint96.RESOLUTION = 96 */
const RESOLUTION = 96;

/**
 * @notice Get amount0 for a given liquidity.
 * amount0 = (L << 96) * (sqrtB - sqrtA) / sqrtB / sqrtA
 */
export function getAmount0ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];
  const numerator = (liquidity << BigInt(RESOLUTION)) * (sb - sa);
  return numerator / sb / sa;
}

/**
 * @notice Get amount1 for a given liquidity.
 * amount1 = L * (sqrtB - sqrtA) / Q96
 */
export function getAmount1ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];
  return mulDiv(liquidity, sb - sa, Q96);
}

/**
 * @notice Get amounts of token0 and token1 for a given liquidity (mirrors getAmountsForLiquidity).
 */
export function getAmountsForLiquidity(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];

  if (sqrtRatioX96 <= sa) {
    return { amount0: getAmount0ForLiquidity(sa, sb, liquidity), amount1: 0n };
  }
  if (sqrtRatioX96 >= sb) {
    return { amount0: 0n, amount1: getAmount1ForLiquidity(sa, sb, liquidity) };
  }
  const amount0 = getAmount0ForLiquidity(sqrtRatioX96, sb, liquidity);
  const amount1 = getAmount1ForLiquidity(sa, sqrtRatioX96, liquidity);
  return { amount0, amount1 };
}

export type DepositEstimate = {
  amount0: bigint;
  amount1: bigint;
  onlyToken0: boolean;
  onlyToken1: boolean;
};

/**
 * @notice Given amount0 (and current price + range), compute the amount1 the contract will use.
 * When price is in range: L from amount0 (segment current->upper), then amount1 from L (segment lower->current).
 * Also returns which-token-only flags for UX.
 */
export function getAmount1ForAmount0(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount0: bigint
): { amount1: bigint; onlyToken0: boolean; onlyToken1: boolean } {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];

  if (sqrtRatioX96 <= sa) {
    return { amount1: 0n, onlyToken0: true, onlyToken1: false };
  }
  if (sqrtRatioX96 >= sb) {
    return { amount1: 0n, onlyToken0: false, onlyToken1: true };
  }
  const liquidity = getLiquidityForAmount0(sqrtRatioX96, sb, amount0);
  const amount1 = getAmount1ForLiquidity(sa, sqrtRatioX96, liquidity);
  return { amount1, onlyToken0: false, onlyToken1: false };
}

/**
 * @notice Estimate deposit amounts and which token(s) will be used.
 * Given desired amount0, returns the amount1 that will be used with it (and flags).
 */
export function estimateDepositAmounts(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount0: bigint,
  amount1Desired: bigint
): DepositEstimate {
  let sa = sqrtRatioAX96;
  let sb = sqrtRatioBX96;
  if (sa > sb) [sa, sb] = [sb, sa];

  if (sqrtRatioX96 <= sa) {
    return { amount0, amount1: 0n, onlyToken0: true, onlyToken1: false };
  }
  if (sqrtRatioX96 >= sb) {
    return { amount0: 0n, amount1: amount1Desired, onlyToken0: false, onlyToken1: true };
  }
  const liquidity = getLiquidityForAmounts(sqrtRatioX96, sa, sb, amount0, amount1Desired);
  const { amount0: a0, amount1: a1 } = getAmountsForLiquidity(sqrtRatioX96, sa, sb, liquidity);
  return { amount0: a0, amount1: a1, onlyToken0: false, onlyToken1: false };
}
