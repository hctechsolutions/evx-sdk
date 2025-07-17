/**
 * @title Chain Configuration
 * @notice Contract addresses for different networks
 * @dev Maps contract names to their addresses for each supported chain
 */
export const chains = {
  sepolia: {
    positionDescriptor: '0x17C50c136887C9258310d9C3331aA0e1f8f98330',
    positionManager: '0x29d077c93A7F5F1092E18B4883B26DD6c934de81',
    positionLens: '0x1D29d573D44E308D161095764FC85f6bAd913d8B',
    swapRouter: '0xDea4395543832560b33F80C4B5cA1F852856D088',
    swapQuoter: '0x6cb7Df410cD1c47e29473154f2FA36cf058D4477',
    pairFlash: '0xdBd297d618f5ab6330a05Fd0645a268F44687452',
    tickLens: '0xA23bfDfd5Ec964A64e04f00bF7BbfbC71d941722',
    factory: '0x822AC7faa4EdA0bfA4c9A4eb5EeeB43d3Cba9CC7',
    dao: '0x0FA0d8D55B6a90823De8fc843cEd7D02F2DE7cC4',
    limitOrderExecutor: '0x0000000000000000000000000000000000000000' // TODO: trocar pelo endereço do contrato implantado, ver com jefferson
  },
  mainnet: {
    positionDescriptor: '0x17C50c136887C9258310d9C3331aA0e1f8f98330',
    positionManager: '0x29d077c93A7F5F1092E18B4883B26DD6c934de81',
    positionLens: '0x1D29d573D44E308D161095764FC85f6bAd913d8B',
    swapRouter: '0xDea4395543832560b33F80C4B5cA1F852856D088',
    swapQuoter: '0x6cb7Df410cD1c47e29473154f2FA36cf058D4477',
    pairFlash: '0xdBd297d618f5ab6330a05Fd0645a268F44687452',
    tickLens: '0xA23bfDfd5Ec964A64e04f00bF7BbfbC71d941722',
    factory: '0x822AC7faa4EdA0bfA4c9A4eb5EeeB43d3Cba9CC7',
    dao: '0x0FA0d8D55B6a90823De8fc843cEd7D02F2DE7cC4',
    limitOrderExecutor: '0x0000000000000000000000000000000000000000' // TODO: trocar pelo endereço do contrato implantado, ver com jefferson
  }
};

/**
 * @title Chain Name Type
 * @notice Type definition for supported chain names
 */
export type ChainName = keyof typeof chains;

/**
 * @title Contract Name Type
 * @notice Type definition for supported contract names
 */
export type ContractName = keyof (typeof chains)[ChainName];
