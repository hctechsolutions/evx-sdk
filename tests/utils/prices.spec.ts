import { decimalToSqrtX96Price, sqrtX96ToDecimalPrice } from '@utils';

describe('Price math utilities', () => {
  it('should convert decimal price 1.0 (equal tokens) to sqrtPriceX96 and back', () => {
    const decimals = 18;
    const price = 1.0;

    const sqrtPriceX96 = decimalToSqrtX96Price(price, decimals, decimals);
    const back = sqrtX96ToDecimalPrice(sqrtPriceX96, decimals, decimals);

    expect(typeof sqrtPriceX96).toBe('bigint');
    expect(back).toBeCloseTo(price, 8);
  });

  it('should convert decimal price 1.0 with different decimals (6 vs 18)', () => {
    const price = 1.0;
    const token0Decimals = 6;
    const token1Decimals = 18;

    const sqrtPriceX96 = decimalToSqrtX96Price(price, token0Decimals, token1Decimals);
    const back = sqrtX96ToDecimalPrice(sqrtPriceX96, token0Decimals, token1Decimals);

    expect(back).toBeCloseTo(price, 8);
  });

  it('should convert price 0.5 with same decimals', () => {
    const price = 0.5;
    const decimals = 18;

    const sqrtPriceX96 = decimalToSqrtX96Price(price, decimals, decimals);
    const back = sqrtX96ToDecimalPrice(sqrtPriceX96, decimals, decimals);

    expect(back).toBeCloseTo(price, 8);
  });

  it('should convert price 2.0 with same decimals', () => {
    const price = 2.0;
    const decimals = 18;

    const sqrtPriceX96 = decimalToSqrtX96Price(price, decimals, decimals);
    const back = sqrtX96ToDecimalPrice(sqrtPriceX96, decimals, decimals);

    expect(back).toBeCloseTo(price, 8);
  });

  it('should preserve approximate value after round-trip (1e-6 tolerance)', () => {
    const price = 123.456;
    const decimals0 = 8;
    const decimals1 = 6;

    const sqrtX96 = decimalToSqrtX96Price(price, decimals0, decimals1);
    const recovered = sqrtX96ToDecimalPrice(sqrtX96, decimals0, decimals1);

    expect(recovered).toBeCloseTo(price, 6);
  });
});
