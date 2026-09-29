import { tokens, type CatalogToken } from '@resources';
import type { ChainId, ChainName } from '@interfaces';
import { getChainId, getChainNameById } from './chains';

export type CatalogTokenRecord = CatalogToken & {
  chainId: ChainId;
  network: ChainName;
};

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

function toRecord(network: ChainName, token: CatalogToken): CatalogTokenRecord {
  return {
    ...token,
    address: normalizeAddress(token.address),
    chainId: getChainId(network),
    network
  };
}

/**
 * @title Get all catalog tokens
 * @notice Flat list across every SDK network (cross-chain catalog)
 */
export function getAllCatalogTokens(): CatalogTokenRecord[] {
  const records: CatalogTokenRecord[] = [];
  for (const network of Object.keys(tokens) as ChainName[]) {
    for (const token of tokens[network]) {
      records.push(toRecord(network, token));
    }
  }
  return records;
}

/**
 * @title Get catalog tokens for a chain
 */
export function getCatalogTokensByChainId(chainId: ChainId): CatalogTokenRecord[] {
  const network = getChainNameById(chainId);
  return tokens[network].map((token: CatalogToken) => toRecord(network, token));
}

/**
 * @title Get one catalog token
 */
export function getCatalogToken(
  chainId: ChainId,
  address: string
): CatalogTokenRecord | undefined {
  const normalized = normalizeAddress(address);
  return getCatalogTokensByChainId(chainId).find(
    (token) => token.address === normalized
  );
}

/**
 * @title Networks with at least one catalog token
 */
export function getCatalogNetworks(): ChainName[] {
  return (Object.keys(tokens) as ChainName[]).filter(
    (network) => tokens[network].length > 0
  );
}

/**
 * @title Stable catalog id for API responses
 */
export function getCatalogTokenId(chainId: ChainId, address: string): string {
  return `${chainId}-${normalizeAddress(address)}`;
}

export { isValidChainId, getChainNameById, getAllChainIds } from './chains';
