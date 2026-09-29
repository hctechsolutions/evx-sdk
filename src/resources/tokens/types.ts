/**
 * @title Token quotation source
 * @notice Price feed configuration for catalog tokens
 */
export type TokenQuotation = {
  name: string;
  url: string;
  method: string;
  params: Record<string, string>;
};

/**
 * @title Catalog token entry
 * @notice ERC-20 metadata served by the Platform token API (SoT for token lists)
 */
export type CatalogToken = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  quotations: [TokenQuotation, ...TokenQuotation[]];
};
