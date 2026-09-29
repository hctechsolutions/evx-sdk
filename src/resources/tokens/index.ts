import type { ChainName } from '@interfaces/resources';
import { anvil } from './anvil';
import { hoodi } from './hoodi';
import { sepolia } from './sepolia';
import type { CatalogToken, TokenQuotation } from './types';

export type { CatalogToken, TokenQuotation };

/**
 * @title Token catalog by network
 * @notice SoT for Platform/Web token lists — networks/contracts live in chains.ts
 */
export const tokens = {
  sepolia,
  hoodi,
  anvil
} satisfies Record<ChainName, CatalogToken[]>;
