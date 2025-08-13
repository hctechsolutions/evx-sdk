import { chains } from '@resources';

/**
 * @title Chain Name Type
 * @notice Type definition for supported chain names
 */
export type ChainName = keyof typeof chains;

/**
 * @title Chain ID Type
 * @notice Type definition for supported chain IDs
 */
export type ChainId = (typeof chains)[ChainName]['metadata']['chainId'];

/**
 * @title Contract Name Type
 * @notice Type definition for supported contract names
 */
export type ContractName = keyof (typeof chains)[ChainName]['contracts'];

/**
 * @title Chain Metadata Type
 * @notice Type definition for chain metadata
 */
export type ChainMetadata = {
  chainId: ChainId;
  explorer: string;
  nativeToken: string;
};
