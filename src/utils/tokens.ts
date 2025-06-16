import { ITokenPair } from '@interfaces/utils/ITokenPair';

/**
 * @title Sort Tokens
 * @notice Sorts token addresses in ascending order
 * @dev Ensures consistent token ordering for contract interactions
 * @param pair The token pair to sort
 * @returns The sorted token pair with token0 < token1
 */
export function sortTokens(pair: ITokenPair): ITokenPair {
  const isCorrectOrder = pair.token0.toLowerCase() < pair.token1.toLowerCase();

  return {
    token0: isCorrectOrder ? pair.token0 : pair.token1,
    token1: isCorrectOrder ? pair.token1 : pair.token0
  } as ITokenPair;
}
