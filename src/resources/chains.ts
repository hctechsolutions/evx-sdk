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
      positionDescriptor: '0x8771F74602DCd156Ea8cec907FB4b80C5AB5A2D4',
      positionManager: '0xf9caf5Aca0d591dbd3f1AFDbA163Ca28e3dFD400',
      positionLens: '0x8b7642E4cFf901DE0Bef11E83ceA6a407b8536fa',
      swapRouter: '0x54322f353fD7098f5b8e1b61736bb26f2DfDcBb9',
      swapQuoter: '0x0e9D243b5e72aede1a3588D10f526ca2b4EE1358',
      pairFlash: '0xEdB5297386F17C17cdCC93804153BcB53235fc98',
      tickLens: '0x25E54207295363F8421f3A0D27f54DaacC33A7Cd',
      factory: '0xfCe1909B6aF92ADD218C90BF5f8aF87A4158e9EF',
      dao: '0x7e72d7697406fDc0eB21E6395663c39E17654413',
      // Story 5.3 — Sepolia airdrop (DeployAirdropDistributor 2026-08-12)
      airdropDistributor: '0x5Ccf8AdF20D9E236033586E943Da9c8299905896',
      evxToken: '0x5587fa17Bef4633e6d5257D6A69c9FD2c9029342'
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
      dao: '0xBde2E7EE0163C0568467bAbe6252E8C3D24Dfce6',
      // Placeholder until Hoodi airdrop deploy (Sepolia is MVP minimum)
      airdropDistributor: '0x0000000000000000000000000000000000000000',
      evxToken: '0x0000000000000000000000000000000000000000'
    }
  },
  anvil: {
    metadata: {
      chainId: 31337,
      explorer: 'http://127.0.0.1:8545',
      nativeToken: '0x9a9f2ccfde556a7e9ff0848998aa4a0cfd8863ae'
    },
    contracts: {
      positionDescriptor: '0xa85233c63b9ee964add6f2cffe00fd84eb32338f',
      positionManager: '0x4a679253410272dd5232b3ff7cf5dbb88f295319',
      positionLens: '0x67d269191c92caf3cd7723f116c85e6e9bf55933',
      swapRouter: '0x7a2088a1bfc9d81c55368ae168c2c02570cb814f',
      swapQuoter: '0xc5a5c42992decbae36851359345fe25997f5c42d',
      pairFlash: '0x09635f643e140090a9a8dcd712ed6285858cebef',
      tickLens: '0xe6e340d132b5f46d1e472debcd681b2abc16e57e',
      factory: '0x3aa5ebb10dc797cac828524e59a333d0a371443c',
      dao: '0xa51c1fc2f0d1a1b8494ed1fe312d7c3a78ed91c0',
      airdropDistributor: '0x0000000000000000000000000000000000000000',
      evxToken: '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    }
  }
};
