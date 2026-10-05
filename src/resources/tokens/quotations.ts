import type { TokenQuotation } from './types';

const ethQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'ETHUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'ethereum', vs_currencies: 'usd' }
  }
];

const fetQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'FETUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'fetch-ai', vs_currencies: 'usd' }
  }
];

const avaxQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'AVAXUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'avalanche-2', vs_currencies: 'usd' }
  }
];

const usdcQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'USDCUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'usd-coin', vs_currencies: 'usd' }
  }
];

const daiQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'DAIUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'dai', vs_currencies: 'usd' }
  }
];

const uniQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'UNIUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'uniswap', vs_currencies: 'usd' }
  }
];

const linkQuotations: [TokenQuotation, ...TokenQuotation[]] = [
  {
    name: 'bybit',
    url: 'https://api.bybit.com/v5/market/tickers',
    method: 'GET',
    params: { category: 'spot', symbol: 'LINKUSDT' }
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    method: 'GET',
    params: { ids: 'chainlink', vs_currencies: 'usd' }
  }
];

/** Price sources keyed by catalog symbol (shared across networks). */
export const quotationsBySymbol = {
  ETH: ethQuotations,
  CETH: ethQuotations,
  WETH: ethQuotations,
  FET: fetQuotations,
  WFET: fetQuotations,
  AVAX: avaxQuotations,
  WAVAX: avaxQuotations,
  LINK: linkQuotations,
  WLINK: linkQuotations,
  USDC: usdcQuotations,
  DAI: daiQuotations,
  UNI: uniQuotations
} as const satisfies Record<string, [TokenQuotation, ...TokenQuotation[]]>;

export type QuotedSymbol = keyof typeof quotationsBySymbol;
