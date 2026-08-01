import {
  getLiquidityForAmount0,
  getLiquidityForAmount1,
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
  getAmountsForLiquidity,
  getAmount1ForAmount0,
  estimateDepositAmounts
} from '@utils';

const Q96 = 2n ** 96n;

describe('LiquidityAmounts', () => {
  describe('getLiquidityForAmount0 / getAmount0ForLiquidity', () => {
    it('should round-trip amount0 and liquidity', () => {
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const amount0 = 1000000n * Q96;
      const liquidity = getLiquidityForAmount0(sqrtA, sqrtB, amount0);
      const back = getAmount0ForLiquidity(sqrtA, sqrtB, liquidity);
      expect(back).toBe(amount0);
    });
  });

  describe('getLiquidityForAmount1 / getAmount1ForLiquidity', () => {
    it('should round-trip amount1 and liquidity', () => {
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const amount1 = 1000000n * Q96;
      const liquidity = getLiquidityForAmount1(sqrtA, sqrtB, amount1);
      const back = getAmount1ForLiquidity(sqrtA, sqrtB, liquidity);
      expect(back).toBe(amount1);
    });
  });

  describe('getAmountsForLiquidity', () => {
    it('should return only amount0 when current price is below range', () => {
      const sqrtX = Q96 / 2n;
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const liquidity = getLiquidityForAmount0(sqrtA, sqrtB, 1000n);
      const { amount0, amount1 } = getAmountsForLiquidity(sqrtX, sqrtA, sqrtB, liquidity);
      expect(amount0 > 0n).toBe(true);
      expect(amount1).toBe(0n);
    });

    it('should return only amount1 when current price is above range', () => {
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const sqrtX = 3n * Q96;
      const liquidity = getLiquidityForAmount1(sqrtA, sqrtB, 1000n);
      const { amount0, amount1 } = getAmountsForLiquidity(sqrtX, sqrtA, sqrtB, liquidity);
      expect(amount0).toBe(0n);
      expect(amount1 > 0n).toBe(true);
    });

    it('should return both amounts when current price is in range', () => {
      const sqrtA = Q96;
      const sqrtB = 3n * Q96;
      const sqrtX = 2n * Q96;
      const liquidity = 1000000n;
      const { amount0, amount1 } = getAmountsForLiquidity(sqrtX, sqrtA, sqrtB, liquidity);
      expect(amount0 > 0n).toBe(true);
      expect(amount1 > 0n).toBe(true);
    });
  });

  describe('getAmount1ForAmount0', () => {
    it('should return onlyToken0 when price is below range', () => {
      const sqrtX = Q96 / 2n;
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const amount0 = 1000n;
      const result = getAmount1ForAmount0(sqrtX, sqrtA, sqrtB, amount0);
      expect(result.onlyToken0).toBe(true);
      expect(result.onlyToken1).toBe(false);
      expect(result.amount1).toBe(0n);
    });

    it('should return onlyToken1 when price is above range', () => {
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const sqrtX = 3n * Q96;
      const amount0 = 1000n;
      const result = getAmount1ForAmount0(sqrtX, sqrtA, sqrtB, amount0);
      expect(result.onlyToken0).toBe(false);
      expect(result.onlyToken1).toBe(true);
      expect(result.amount1).toBe(0n);
    });

    it('should return amount1 and no single-token flags when price is in range', () => {
      const sqrtA = Q96;
      const sqrtB = 3n * Q96;
      const sqrtX = 2n * Q96;
      const amount0 = 1000000n;
      const result = getAmount1ForAmount0(sqrtX, sqrtA, sqrtB, amount0);
      expect(result.onlyToken0).toBe(false);
      expect(result.onlyToken1).toBe(false);
      expect(result.amount1 > 0n).toBe(true);
    });

    it('should accept reversed sqrtA/sqrtB order', () => {
      const sqrtA = 2n * Q96;
      const sqrtB = Q96;
      const sqrtX = (1500000n * Q96) / 1000000n;
      const amount0 = 1000000n;
      const result = getAmount1ForAmount0(sqrtX, sqrtA, sqrtB, amount0);
      expect(result.onlyToken0).toBe(false);
      expect(result.onlyToken1).toBe(false);
      expect(result.amount1 >= 0n).toBe(true);
    });
  });

  describe('estimateDepositAmounts', () => {
    it('should return only token0 when price below range', () => {
      const sqrtX = Q96 / 2n;
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const result = estimateDepositAmounts(sqrtX, sqrtA, sqrtB, 1000n, 1000n);
      expect(result.onlyToken0).toBe(true);
      expect(result.onlyToken1).toBe(false);
      expect(result.amount0 > 0n).toBe(true);
      expect(result.amount1).toBe(0n);
    });

    it('should return only token1 when price above range', () => {
      const sqrtA = Q96;
      const sqrtB = 2n * Q96;
      const sqrtX = 3n * Q96;
      const result = estimateDepositAmounts(sqrtX, sqrtA, sqrtB, 1000n, 1000n);
      expect(result.onlyToken0).toBe(false);
      expect(result.onlyToken1).toBe(true);
      expect(result.amount0).toBe(0n);
      expect(result.amount1 > 0n).toBe(true);
    });
  });
});
