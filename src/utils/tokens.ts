import { ITokenPair } from '@interfaces/utils/ITokenPair';

export function sortTokens(pair: ITokenPair): ITokenPair {
  const isCorrectOrder = pair.token0.toLowerCase() < pair.token1.toLowerCase();

  return {
    token0: isCorrectOrder ? pair.token0 : pair.token1,
    token1: isCorrectOrder ? pair.token1 : pair.token0,
  } as ITokenPair;
}
