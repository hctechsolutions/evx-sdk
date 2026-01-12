/**
 * @title Chain Configuration
 * @notice Contract addresses for different networks
 * @dev Maps contract names to their addresses for each supported chain
 * @notice Native tokens here are the WETH9 token of the chain
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
      positionLens: '0x1D29d573D44E308D161095764FC85f6bAd913d8B',
      swapRouter: '0xDea4395543832560b33F80C4B5cA1F852856D088',
      swapQuoter: '0x6cb7Df410cD1c47e29473154f2FA36cf058D4477',
      pairFlash: '0xdBd297d618f5ab6330a05Fd0645a268F44687452',
      tickLens: '0x9706cA44f004054BAA842b5db1f62f6c9b77A095',
      factory: '0x822AC7faa4EdA0bfA4c9A4eb5EeeB43d3Cba9CC7',
      dao: '0x0FA0d8D55B6a90823De8fc843cEd7D02F2DE7cC4'
    }
  },
  hoodi: {
    metadata: {
      chainId: 560048,
      explorer: 'https://hoodi.etherscan.io',
      nativeToken: '0x962EE10D3F66D8fB020e8d0eD0aa36367d25626F'
    },
    contracts: {
      positionDescriptor: '0xfF6769162e3217597fD8a826CDBD5f3128639b4a',
      positionManager: '0xC9daB4D11024C2298268a056c5Ffb84A6b707285',
      positionLens: '0xa0DE711EE99dB101F22ea5cee82D423aC7282284',
      swapRouter: '0x1EBaB85A6E3489B8CC266B6Dc5BdD30Ed746368d',
      swapQuoter: '0xC8d85F26F790828C33E8e76d67B2D73a0f4Cc66B',
      pairFlash: '0xbFaC029008475Cc2F209C41876fd7f258EA82b1E',
      tickLens: '0x966Cb9B74da374Ad6776Fd44833CE0C21a8c8dA4',
      factory: '0x04dE425EE9A0b15721764D7CC8e83B7Fd5E17Fd8',
      dao: '0xBde2E7EE0163C0568467bAbe6252E8C3D24Dfce6'
    }
  }
};
