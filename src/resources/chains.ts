/**
 * @title Chain Configuration
 * @notice Contract addresses for different networks
 * @dev Maps contract names to their addresses for each supported chain
 */
export const chains = {
  sepolia: {
    metadata: {
      chainId: 11155111,
      explorer: 'https://sepolia.etherscan.io',
      nativeToken: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
    },
    contracts: {
      positionDescriptor: '0x17C50c136887C9258310d9C3331aA0e1f8f98330',
      positionManager: '0x29d077c93A7F5F1092E18B4883B26DD6c934de81',
      orderExecutor: '0x7fC548F0d27f7D6aAC90d2923b7c0EdF2c8198f2',
      positionLens: '0x1D29d573D44E308D161095764FC85f6bAd913d8B',
      swapRouter: '0xDea4395543832560b33F80C4B5cA1F852856D088',
      swapQuoter: '0x6cb7Df410cD1c47e29473154f2FA36cf058D4477',
      pairFlash: '0xdBd297d618f5ab6330a05Fd0645a268F44687452',
      tickLens: '0x9706cA44f004054BAA842b5db1f62f6c9b77A095',
      factory: '0x822AC7faa4EdA0bfA4c9A4eb5EeeB43d3Cba9CC7',
      dao: '0x0FA0d8D55B6a90823De8fc843cEd7D02F2DE7cC4'
    }
  }
};
