import { decimalToBigInt, bigIntToDecimal } from '@utils';

describe('Number conversion utilities', () => {
  describe('decimalToBigInt', () => {
    it('should convert 1.0 to BigInt with 18 decimals', () => {
      const result = decimalToBigInt(1.0, 18);
      expect(result).toBe(1000000000000000000n);
    });

    it('should convert 1.0 to BigInt with 6 decimals', () => {
      const result = decimalToBigInt(1.0, 6);
      expect(result).toBe(1000000n);
    });

    it('should convert 0.5 to BigInt with 18 decimals', () => {
      const result = decimalToBigInt(0.5, 18);
      expect(result).toBe(500000000000000000n);
    });

    it('should convert 123.456 to BigInt with 18 decimals', () => {
      const result = decimalToBigInt(123.456, 18);
      expect(result).toBe(123456000000000000000n);
    });

    it('should convert string "1.0" to BigInt with 18 decimals', () => {
      const result = decimalToBigInt('1.0', 18);
      expect(result).toBe(1000000000000000000n);
    });

    it('should convert string "0.000001" to BigInt with 18 decimals', () => {
      const result = decimalToBigInt('0.000001', 18);
      expect(result).toBe(1000000000000n);
    });

    it('should convert 0 to BigInt with 18 decimals', () => {
      const result = decimalToBigInt(0, 18);
      expect(result).toBe(0n);
    });

    it('should convert very large number to BigInt with 18 decimals', () => {
      const result = decimalToBigInt('999999999.999999999', 18);
      expect(result).toBe(999999999999999999000000000n);
    });

    it('should handle numbers with many decimal places', () => {
      const result = decimalToBigInt('0.123456789123456789', 18);
      expect(result).toBe(123456789123456789n);
    });

    it('should use default 18 decimals when not specified', () => {
      const result = decimalToBigInt(1.0);
      expect(result).toBe(1000000000000000000n);
    });
  });

  describe('bigIntToDecimal', () => {
    it('should convert BigInt with 18 decimals to 1.0', () => {
      const result = bigIntToDecimal(1000000000000000000n, 18);
      expect(result).toBe('1.0');
    });

    it('should convert BigInt with 6 decimals to 1.0', () => {
      const result = bigIntToDecimal(1000000n, 6);
      expect(result).toBe('1.0');
    });

    it('should convert BigInt with 18 decimals to 0.5', () => {
      const result = bigIntToDecimal(500000000000000000n, 18);
      expect(result).toBe('0.5');
    });

    it('should convert BigInt with 18 decimals to 123.456', () => {
      const result = bigIntToDecimal(123456000000000000000n, 18);
      expect(result).toBe('123.456');
    });

    it('should convert BigInt with 18 decimals to 0.000001', () => {
      const result = bigIntToDecimal(1000000000000n, 18);
      expect(result).toBe('0.000001');
    });

    it('should convert 0 BigInt to 0.0', () => {
      const result = bigIntToDecimal(0n, 18);
      expect(result).toBe('0.0');
    });

    it('should convert very large BigInt with 18 decimals', () => {
      const result = bigIntToDecimal(999999999999999999000000000n, 18);
      expect(result).toBe('999999999.999999999');
    });

    it('should handle BigInt with many decimal places', () => {
      const result = bigIntToDecimal(123456789123456789n, 18);
      expect(result).toBe('0.123456789123456789');
    });

    it('should use default 18 decimals when not specified', () => {
      const result = bigIntToDecimal(1000000000000000000n);
      expect(result).toBe('1.0');
    });

    it('should handle very small values correctly', () => {
      const result = bigIntToDecimal(1n, 18);
      expect(result).toBe('0.000000000000000001');
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain value through decimalToBigInt → bigIntToDecimal conversion (18 decimals)', () => {
      const originalValue = '123.456789';
      const bigIntValue = decimalToBigInt(originalValue, 18);
      const backToDecimal = bigIntToDecimal(bigIntValue, 18);
      expect(backToDecimal).toBe(originalValue);
    });

    it('should maintain value through decimalToBigInt → bigIntToDecimal conversion (6 decimals)', () => {
      const originalValue = '123.456';
      const bigIntValue = decimalToBigInt(originalValue, 6);
      const backToDecimal = bigIntToDecimal(bigIntValue, 6);
      expect(backToDecimal).toBe(originalValue);
    });

    it('should maintain value through decimalToBigInt → bigIntToDecimal conversion (8 decimals)', () => {
      const originalValue = '0.12345678';
      const bigIntValue = decimalToBigInt(originalValue, 8);
      const backToDecimal = bigIntToDecimal(bigIntValue, 8);
      expect(backToDecimal).toBe(originalValue);
    });

    it('should maintain value with very small numbers', () => {
      const originalValue = '0.000000000000000001';
      const bigIntValue = decimalToBigInt(originalValue, 18);
      const backToDecimal = bigIntToDecimal(bigIntValue, 18);
      expect(backToDecimal).toBe(originalValue);
    });

    it('should maintain value with very large numbers', () => {
      const originalValue = '999999999.999999999';
      const bigIntValue = decimalToBigInt(originalValue, 18);
      const backToDecimal = bigIntToDecimal(bigIntValue, 18);
      expect(backToDecimal).toBe(originalValue);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero values correctly', () => {
      expect(decimalToBigInt(0, 18)).toBe(0n);
      expect(bigIntToDecimal(0n, 18)).toBe('0.0');
    });

    it('should handle negative numbers correctly', () => {
      // ethers.parseUnits accepts negative numbers
      const result = decimalToBigInt(-1, 18);
      expect(result).toBe(-1000000000000000000n);
    });

    it('should handle very large BigInt values', () => {
      const largeValue = 999999999999999999999999999999999999999n;
      const result = bigIntToDecimal(largeValue, 18);
      expect(result).toBe('999999999999999999999.999999999999999999');
    });

    it('should handle different decimal places correctly', () => {
      const testCases = [
        { value: '1.0', decimals: 6, expected: '1000000' },
        { value: '1.0', decimals: 8, expected: '100000000' },
        { value: '1.0', decimals: 12, expected: '1000000000000' },
        { value: '1.0', decimals: 18, expected: '1000000000000000000' }
      ];

      testCases.forEach(({ value, decimals, expected }) => {
        const result = decimalToBigInt(value, decimals);
        expect(result.toString()).toBe(expected);
      });
    });
  });

  describe('Real-world token scenarios', () => {
    it('should handle ETH amounts correctly (18 decimals)', () => {
      const ethAmount = '1.5';
      const weiAmount = decimalToBigInt(ethAmount, 18);
      expect(weiAmount).toBe(1500000000000000000n);

      const backToEth = bigIntToDecimal(weiAmount, 18);
      expect(backToEth).toBe(ethAmount);
    });

    it('should handle USDC amounts correctly (6 decimals)', () => {
      const usdcAmount = '1000.50';
      const rawAmount = decimalToBigInt(usdcAmount, 6);
      expect(rawAmount).toBe(1000500000n);

      const backToUsdc = bigIntToDecimal(rawAmount, 6);
      expect(backToUsdc).toBe('1000.5'); // ethers.formatUnits removes trailing zeros
    });

    it('should handle WBTC amounts correctly (8 decimals)', () => {
      const wbtcAmount = '0.00123456';
      const rawAmount = decimalToBigInt(wbtcAmount, 8);
      expect(rawAmount).toBe(123456n);

      const backToWbtc = bigIntToDecimal(rawAmount, 8);
      expect(backToWbtc).toBe(wbtcAmount);
    });
  });
});
