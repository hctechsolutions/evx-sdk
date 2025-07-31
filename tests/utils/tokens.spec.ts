import { sortTokens } from '@utils';
import { ITokenPair } from '@interfaces/utils/ITokenPair';

describe('Token utilities', () => {
  describe('sortTokens', () => {
    it('should sort tokens in ascending order when token0 < token1', () => {
      const pair: ITokenPair = {
        token0: '0x1234567890123456789012345678901234567890',
        token1: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    it('should swap tokens when token0 > token1', () => {
      const pair: ITokenPair = {
        token0: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    it('should handle case-insensitive comparison', () => {
      const pair: ITokenPair = {
        token0: '0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD',
        token1: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      };

      const result = sortTokens(pair);

      // The function uses toLowerCase() for comparison, so it should sort correctly
      expect(result.token0).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
      expect(result.token1).toBe('0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD');
    });

    it('should handle mixed case addresses', () => {
      const pair: ITokenPair = {
        token0: '0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd');
    });

    it('should handle addresses with same prefix but different suffixes', () => {
      const pair: ITokenPair = {
        token0: '0x1234567890123456789012345678901234567891',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0x1234567890123456789012345678901234567891');
    });

    it('should handle addresses with different lengths', () => {
      const pair: ITokenPair = {
        token0: '0x1234567890123456789012345678901234567890123456789012345678901234',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe(
        '0x1234567890123456789012345678901234567890123456789012345678901234'
      );
    });

    it('should handle edge case with identical addresses', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const pair: ITokenPair = {
        token0: address,
        token1: address
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe(address);
      expect(result.token1).toBe(address);
    });

    it('should handle addresses with leading zeros', () => {
      const pair: ITokenPair = {
        token0: '0x0000000000000000000000000000000000000001',
        token1: '0x0000000000000000000000000000000000000000'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x0000000000000000000000000000000000000000');
      expect(result.token1).toBe('0x0000000000000000000000000000000000000001');
    });

    it('should handle addresses with all zeros vs non-zero', () => {
      const pair: ITokenPair = {
        token0: '0x0000000000000000000000000000000000000000',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x0000000000000000000000000000000000000000');
      expect(result.token1).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle addresses with all Fs vs other addresses', () => {
      const pair: ITokenPair = {
        token0: '0xffffffffffffffffffffffffffffffffffffffff',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0xffffffffffffffffffffffffffffffffffffffff');
    });

    it('should return a new object, not modify the original', () => {
      const originalPair: ITokenPair = {
        token0: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        token1: '0x1234567890123456789012345678901234567890'
      };

      const result = sortTokens(originalPair);

      // Verify the result is sorted
      expect(result.token0).toBe('0x1234567890123456789012345678901234567890');
      expect(result.token1).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');

      // Verify the original is unchanged
      expect(originalPair.token0).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
      expect(originalPair.token1).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle real-world token addresses', () => {
      const pair: ITokenPair = {
        token0: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8', // WETH
        token1: '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
      };

      const result = sortTokens(pair);

      expect(result.token0).toBe('0x6B175474E89094C44Da98b954EedeAC495271d0F');
      expect(result.token1).toBe('0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C8');
    });
  });
});
