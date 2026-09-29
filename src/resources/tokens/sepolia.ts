import type { CatalogToken } from './types';
import { quotationsBySymbol } from './quotations';

const ETH_LOGO =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png';

/** Sepolia testnet token catalog (hand-maintained). */
export const sepolia: CatalogToken[] = [
  {
    address: '0x00236c215a0D2BF32D01fF8FdEEf6b6A4ad5D52e',
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
    logoURI: ETH_LOGO,
    quotations: quotationsBySymbol.ETH
  },
  {
    address: '0x109b39d11aE5036A7E14458A769F20d55f7F28da',
    name: 'Custom ETH',
    symbol: 'CETH',
    decimals: 18,
    logoURI: ETH_LOGO,
    quotations: quotationsBySymbol.CETH
  },
  {
    address: '0xDB528a363B03be83a78c9120Ad8020fdD9E55fB7',
    name: 'Wrapped FET',
    symbol: 'WFET',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png',
    quotations: quotationsBySymbol.WFET
  },
  {
    address: '0x295E796548cdbC6Ebb5e7ED46bc5576A3c61AE50',
    name: 'Wrapped AVAX',
    symbol: 'WAVAX',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/avalanchec/assets/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
    quotations: quotationsBySymbol.WAVAX
  },
  {
    address: '0x8B6b1DC75e232F3D41D26A8439B2141AEaf49663',
    name: 'Wrapped LINK',
    symbol: 'WLINK',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
    quotations: quotationsBySymbol.WLINK
  }
];
