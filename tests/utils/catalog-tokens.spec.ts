import {
  getAllCatalogTokens,
  getCatalogToken,
  getCatalogTokensByChainId,
  getCatalogNetworks,
  getCatalogTokenId
} from '@utils';

describe('Catalog token utilities', () => {
  it('returns Sepolia tokens with chainId and network', () => {
    const sepolia = getCatalogTokensByChainId(11155111);
    expect(sepolia.length).toBe(5);
    expect(sepolia[0]).toMatchObject({
      chainId: 11155111,
      network: 'sepolia',
      symbol: expect.any(String)
    });
    expect(sepolia[0].address).toBe(sepolia[0].address.toLowerCase());
    expect(sepolia.every((t) => t.quotations.length >= 1)).toBe(true);
  });

  it('returns Anvil fixture tokens without EVX', () => {
    const anvil = getCatalogTokensByChainId(31337);
    expect(anvil.map((t) => t.symbol)).toEqual(
      expect.arrayContaining(['WETH', 'FET', 'AVAX'])
    );
    expect(anvil.map((t) => t.symbol)).not.toContain('EVX');
    expect(anvil.every((t) => t.quotations.some((q) => q.name === 'bybit'))).toBe(
      true
    );
  });

  it('returns empty Hoodi catalog', () => {
    expect(getCatalogTokensByChainId(560048)).toEqual([]);
  });

  it('finds token by chain and address case-insensitively', () => {
    const token = getCatalogToken(
      11155111,
      '0x00236c215a0D2BF32D01fF8FdEEf6b6A4ad5D52e'
    );
    expect(token?.symbol).toBe('ETH');
    expect(token?.quotations.length).toBeGreaterThanOrEqual(1);
  });

  it('lists all tokens cross-chain', () => {
    const all = getAllCatalogTokens();
    expect(all.length).toBe(8);
    expect(new Set(all.map((t) => t.chainId))).toEqual(
      new Set([11155111, 31337])
    );
    expect(all.every((t) => t.quotations.length >= 1)).toBe(true);
  });

  it('lists networks with inventory', () => {
    expect(getCatalogNetworks()).toEqual(['sepolia', 'anvil']);
  });

  it('builds stable catalog ids', () => {
    expect(getCatalogTokenId(31337, '0xABC')).toBe('31337-0xabc');
  });

  it('does not list EVX token contract in catalog', () => {
    const evx = getCatalogToken(
      31337,
      '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    );
    expect(evx).toBeUndefined();
  });
});
