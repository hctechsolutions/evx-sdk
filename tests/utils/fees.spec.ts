import {
  percentageToBasisPoints,
  basisPointsToPercentage,
  percentageToFee,
  feeToPercentage,
  basisPointsToFee,
  feeToBasisPoints
} from '@utils';

describe('Fee conversion utilities', () => {
  describe('percentageToBasisPoints', () => {
    it('should convert 0.3% to 30 basis points', () => {
      const result = percentageToBasisPoints(0.3);
      expect(result).toBe(30n);
    });

    it('should convert 1% to 100 basis points', () => {
      const result = percentageToBasisPoints(1);
      expect(result).toBe(100n);
    });

    it('should convert 0.01% to 1 basis point', () => {
      const result = percentageToBasisPoints(0.01);
      expect(result).toBe(1n);
    });

    it('should convert 100% to 10000 basis points', () => {
      const result = percentageToBasisPoints(100);
      expect(result).toBe(10000n);
    });

    it('should round decimal percentages correctly', () => {
      const result = percentageToBasisPoints(0.333);
      expect(result).toBe(33n); // 0.333 * 100 = 33.3, rounded to 33
    });
  });

  describe('basisPointsToPercentage', () => {
    it('should convert 30 basis points to 0.3%', () => {
      const result = basisPointsToPercentage(30n);
      expect(result).toBe(0.3);
    });

    it('should convert 100 basis points to 1%', () => {
      const result = basisPointsToPercentage(100n);
      expect(result).toBe(1);
    });

    it('should convert 1 basis point to 0.01%', () => {
      const result = basisPointsToPercentage(1n);
      expect(result).toBe(0.01);
    });

    it('should convert 10000 basis points to 100%', () => {
      const result = basisPointsToPercentage(10000n);
      expect(result).toBe(100);
    });

    it('should handle large basis point values', () => {
      const result = basisPointsToPercentage(5000n);
      expect(result).toBe(50);
    });
  });

  describe('percentageToFee', () => {
    it('should convert 0.3% to 3000 Evx fee units', () => {
      const result = percentageToFee(0.3);
      expect(result).toBe(3000n);
    });

    it('should convert 1% to 10000 Evx fee units', () => {
      const result = percentageToFee(1);
      expect(result).toBe(10000n);
    });

    it('should convert 0.01% to 100 Evx fee units', () => {
      const result = percentageToFee(0.01);
      expect(result).toBe(100n);
    });

    it('should convert 100% to 1000000 Evx fee units', () => {
      const result = percentageToFee(100);
      expect(result).toBe(1000000n);
    });

    it('should round decimal percentages correctly', () => {
      const result = percentageToFee(0.333);
      expect(result).toBe(3330n); // 0.333 * 10000 = 3330
    });
  });

  describe('feeToPercentage', () => {
    it('should convert 3000 Evx fee units to 0.3%', () => {
      const result = feeToPercentage(3000n);
      expect(result).toBe(0.3);
    });

    it('should convert 10000 Evx fee units to 1%', () => {
      const result = feeToPercentage(10000n);
      expect(result).toBe(1);
    });

    it('should convert 100 Evx fee units to 0.01%', () => {
      const result = feeToPercentage(100n);
      expect(result).toBe(0.01);
    });

    it('should convert 1000000 Evx fee units to 100%', () => {
      const result = feeToPercentage(1000000n);
      expect(result).toBe(100);
    });

    it('should handle large fee values', () => {
      const result = feeToPercentage(500000n);
      expect(result).toBe(50);
    });
  });

  describe('basisPointsToFee', () => {
    it('should convert 30 basis points to 3000 Evx fee units', () => {
      const result = basisPointsToFee(30n);
      expect(result).toBe(3000n);
    });

    it('should convert 100 basis points to 10000 Evx fee units', () => {
      const result = basisPointsToFee(100n);
      expect(result).toBe(10000n);
    });

    it('should convert 1 basis point to 100 Evx fee units', () => {
      const result = basisPointsToFee(1n);
      expect(result).toBe(100n);
    });

    it('should convert 10000 basis points to 1000000 Evx fee units', () => {
      const result = basisPointsToFee(10000n);
      expect(result).toBe(1000000n);
    });

    it('should handle large basis point values', () => {
      const result = basisPointsToFee(5000n);
      expect(result).toBe(500000n);
    });
  });

  describe('feeToBasisPoints', () => {
    it('should convert 3000 Evx fee units to 30 basis points', () => {
      const result = feeToBasisPoints(3000n);
      expect(result).toBe(30n);
    });

    it('should convert 10000 Evx fee units to 100 basis points', () => {
      const result = feeToBasisPoints(10000n);
      expect(result).toBe(100n);
    });

    it('should convert 100 Evx fee units to 1 basis point', () => {
      const result = feeToBasisPoints(100n);
      expect(result).toBe(1n);
    });

    it('should convert 1000000 Evx fee units to 10000 basis points', () => {
      const result = feeToBasisPoints(1000000n);
      expect(result).toBe(10000n);
    });

    it('should handle large fee values', () => {
      const result = feeToBasisPoints(500000n);
      expect(result).toBe(5000n);
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain value through percentage ↔ basis points conversion', () => {
      const originalPercentage = 0.3;
      const bps = percentageToBasisPoints(originalPercentage);
      const backToPercentage = basisPointsToPercentage(bps);
      expect(backToPercentage).toBe(originalPercentage);
    });

    it('should maintain value through percentage ↔ fee conversion', () => {
      const originalPercentage = 0.3;
      const fee = percentageToFee(originalPercentage);
      const backToPercentage = feeToPercentage(fee);
      expect(backToPercentage).toBe(originalPercentage);
    });

    it('should maintain value through basis points ↔ fee conversion', () => {
      const originalBps = 30n;
      const fee = basisPointsToFee(originalBps);
      const backToBps = feeToBasisPoints(fee);
      expect(backToBps).toBe(originalBps);
    });

    it('should maintain value through full cycle conversion', () => {
      const originalPercentage = 0.3;
      const bps = percentageToBasisPoints(originalPercentage);
      const fee = basisPointsToFee(bps);
      const backToBps = feeToBasisPoints(fee);
      const backToPercentage = basisPointsToPercentage(backToBps);
      expect(backToPercentage).toBe(originalPercentage);
    });
  });

  describe('Edge cases', () => {
    it('should handle 0% correctly', () => {
      expect(percentageToBasisPoints(0)).toBe(0n);
      expect(percentageToFee(0)).toBe(0n);
      expect(basisPointsToPercentage(0n)).toBe(0);
      expect(feeToPercentage(0n)).toBe(0);
    });

    it('should handle very small percentages', () => {
      expect(percentageToBasisPoints(0.0001)).toBe(0n); // Rounds to 0
      expect(percentageToFee(0.0001)).toBe(1n); // 0.0001% = 1 Evx unit
    });

    it('should handle very large percentages', () => {
      expect(percentageToBasisPoints(1000)).toBe(100000n);
      expect(percentageToFee(1000)).toBe(10000000n);
    });
  });
});
