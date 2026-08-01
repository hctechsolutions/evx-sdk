import { decimalToSqrtX96Price, sqrtX96ToFloat } from './prices';

/**
 * @title Liquidity (high-level)
 * @notice High-level helpers for position amounts based on **USD value** and decimal prices.
 * @description
 * For **contract-aligned** math (bigint, sqrtPriceX96) use `liquidityAmounts.ts` instead:
 * getAmount1ForAmount0, getLiquidityForAmounts, getAmountsForLiquidity, etc.
 */

/**
 * @title Calculate Amounts For Position
 * @notice Calculates token0 and token1 amounts for a position based on price range and total USD value
 * @dev Uses Uniswap V3 formulas to calculate the correct amounts based on sqrtPriceX96
 *
 * IMPORTANT: minPrice and maxPrice are in terms of token1/token0 (how many token0 to buy 1 token1)
 * This matches the convention used in PriceRangeCard and forms.
 *
 * Uniswap V3 Formulas:
 * - If sqrtPrice < sqrtPriceLower: only token0 needed
 * - If sqrtPrice > sqrtPriceUpper: only token1 needed
 * - If sqrtPrice is between: amount0 = L * (sqrtPriceUpper - sqrtPrice) / (sqrtPrice * sqrtPriceUpper)
 *                            amount1 = L * (sqrtPrice - sqrtPriceLower)
 *
 * Where L is the liquidity calculated to maintain constant total USD value.
 *
 * @param minPrice - Minimum price (token1 in terms of token0, e.g., "141.9894")
 * @param maxPrice - Maximum price (token1 in terms of token0, e.g., "180.5017")
 * @param token0Price - Price of token0 in USD
 * @param token1Price - Price of token1 in USD
 * @param decimals0 - Decimals of token0
 * @param decimals1 - Decimals of token1
 * @param totalValueUsd - Total value in USD that the user wants to deposit
 * @returns Object with amount0 and amount1 calculated as strings (to maintain precision)
 */
export function calculateAmountsForPosition(
  minPrice: string | number,
  maxPrice: string | number,
  token0Price: number,
  token1Price: number,
  decimals0 = 18,
  decimals1 = 18,
  totalValueUsd = 100
): { amount0: string; amount1: string } {
  const minPriceNum = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
  const maxPriceNum = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;

  // Validate inputs
  if (minPriceNum <= 0 || maxPriceNum <= 0 || minPriceNum >= maxPriceNum) {
    return { amount0: '0', amount1: '0' };
  }

  if (token0Price <= 0 || token1Price <= 0) {
    return { amount0: '0', amount1: '0' };
  }

  // Convert prices to sqrtPriceX96
  // Note: decimalToSqrtX96Price expects price in token0/token1 format
  // But minPrice/maxPrice are in token1/token0, so we need to invert
  const minPriceToken0Token1 = 1 / minPriceNum;
  const maxPriceToken0Token1 = 1 / maxPriceNum;
  const currentPriceToken0Token1 = token0Price / token1Price;

  const sqrtPriceLowerX96 = decimalToSqrtX96Price(minPriceToken0Token1, decimals0, decimals1);
  const sqrtPriceUpperX96 = decimalToSqrtX96Price(maxPriceToken0Token1, decimals0, decimals1);
  const sqrtPriceCurrentX96 = decimalToSqrtX96Price(currentPriceToken0Token1, decimals0, decimals1);

  // Convert bigint to number for calculations (with precision handling)
  const sqrtPriceLower = sqrtX96ToFloat(sqrtPriceLowerX96);
  const sqrtPriceUpper = sqrtX96ToFloat(sqrtPriceUpperX96);
  const sqrtPrice = sqrtX96ToFloat(sqrtPriceCurrentX96);

  let amount0 = 0;
  let amount1 = 0;

  if (sqrtPrice <= sqrtPriceLower) {
    // Price is below minimum: only token0 is needed
    amount0 = totalValueUsd / token0Price;
    amount1 = 0;
  } else if (sqrtPrice >= sqrtPriceUpper) {
    // Price is above maximum: only token1 is needed
    amount0 = 0;
    amount1 = totalValueUsd / token1Price;
  } else {
    // Price is within range: both tokens are needed
    // Use correct Uniswap V3 formulas to calculate amounts
    //
    // Formula Uniswap V3:
    // amount0 = L * (sqrtPriceUpper - sqrtPrice) / (sqrtPrice * sqrtPriceUpper)
    // amount1 = L * (sqrtPrice - sqrtPriceLower)
    //
    // Where L is liquidity. To calculate based on total USD value,
    // we need to solve for L that results in the desired total value.

    // Calculate proportions of amount0 and amount1 using Uniswap V3 formula
    // For unit liquidity L = 1, calculate how much of each token we would have
    const L = 1; // Unit liquidity to calculate proportions

    // Using the correct Uniswap V3 formulas from LiquidityAmounts library
    // amount0 = L * (sqrtPriceUpper - sqrtPrice) / (sqrtPrice * sqrtPriceUpper)
    // amount1 = L * (sqrtPrice - sqrtPriceLower)
    const amount0ForUnitLiquidity =
      (L * (sqrtPriceUpper - sqrtPrice)) / (sqrtPrice * sqrtPriceUpper);
    const amount1ForUnitLiquidity = L * (sqrtPrice - sqrtPriceLower);

    // Calculate USD value for unit liquidity
    const value0ForUnitLiquidity = amount0ForUnitLiquidity * token0Price;
    const value1ForUnitLiquidity = amount1ForUnitLiquidity * token1Price;
    const totalValueForUnitLiquidity = value0ForUnitLiquidity + value1ForUnitLiquidity;

    if (totalValueForUnitLiquidity > 0) {
      // Calculate scale factor needed to reach desired total value
      // Since amount0 and amount1 are proportional to liquidity, we can scale linearly
      const liquidityScale = totalValueUsd / totalValueForUnitLiquidity;

      amount0 = amount0ForUnitLiquidity * liquidityScale;
      amount1 = amount1ForUnitLiquidity * liquidityScale;
    } else {
      // Fallback: distribute equally if something goes wrong
      amount0 = (totalValueUsd * 0.5) / token0Price;
      amount1 = (totalValueUsd * 0.5) / token1Price;
    }
  }

  // Round to avoid precision issues
  const precision0 = Math.pow(10, decimals0);
  const precision1 = Math.pow(10, decimals1);

  amount0 = Math.floor(amount0 * precision0) / precision0;
  amount1 = Math.floor(amount1 * precision1) / precision1;

  // Ensure we don't return negative values or NaN
  if (isNaN(amount0) || isNaN(amount1) || amount0 < 0 || amount1 < 0) {
    return { amount0: '0', amount1: '0' };
  }

  // Return as strings to maintain precision
  return {
    amount0: amount0.toString(),
    amount1: amount1.toString()
  };
}
