import { ITokenPair } from '@interfaces/utils/ITokenPair';
import { sortTokens } from '@utils';

describe('sortTokens', () => {
  it('should return the pair as-is when token0 < token1', () => {
    const input: ITokenPair = {
      token0: '0x1111111111111111111111111111111111111111',
      token1: '0x2222222222222222222222222222222222222222'
    };

    const result = sortTokens(input);

    expect(result.token0).toBe(input.token0);
    expect(result.token1).toBe(input.token1);
  });

  it('should sort the tokens when token0 > token1', () => {
    const input: ITokenPair = {
      token0: '0xDEADBEEF00000000000000000000000000000000',
      token1: '0xABCDEF0000000000000000000000000000000000'
    };

    const result = sortTokens(input);

    expect(result.token0).toBe(input.token1);
    expect(result.token1).toBe(input.token0);
  });

  it('should sort tokens case-insensitively', () => {
    const input: ITokenPair = {
      token0: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa',
      token1: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
    };

    const result = sortTokens(input);

    expect(result.token0.toLowerCase()).toBe(input.token0.toLowerCase());
    expect(result.token1.toLowerCase()).toBe(input.token1.toLowerCase());
  });

  it('should keep tokens in place when both are the same', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    const input: ITokenPair = {
      token0: addr,
      token1: addr
    };

    const result = sortTokens(input);

    expect(result.token0).toBe(addr);
    expect(result.token1).toBe(addr);
  });
});
