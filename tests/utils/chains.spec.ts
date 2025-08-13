import {
  getChainId,
  getChainNameById,
  isValidChainId,
  isValidChainName,
  getAllChainIds,
  getAllChainNames,
  getChainMetadata,
  getAllChainsMetadata
} from '../../src/utils/chains';
import { chains } from '../../src/resources/chains';
import { ChainName, ChainId } from '../../src/interfaces';

describe('Chain Utils', () => {
  const mockChainName = 'sepolia' as ChainName;
  const mockChainId = 11155111 as ChainId;

  describe('getChainId', () => {
    it('should return chain ID for valid chain name', () => {
      const result = getChainId(mockChainName);
      expect(result).toBe(mockChainId);
    });

    it('should throw error for invalid chain name', () => {
      expect(() => getChainId('invalid-chain' as ChainName)).toThrow(
        'Chain not found: invalid-chain'
      );
    });
  });

  describe('getChainNameById', () => {
    it('should return chain name for valid chain ID', () => {
      const result = getChainNameById(mockChainId);
      expect(result).toBe(mockChainName);
    });

    it('should throw error for invalid chain ID', () => {
      expect(() => getChainNameById(999999 as ChainId)).toThrow('Chain ID not found: 999999');
    });
  });

  describe('isValidChainId', () => {
    it('should return true for valid chain ID', () => {
      const result = isValidChainId(mockChainId);
      expect(result).toBe(true);
    });

    it('should return false for invalid chain ID', () => {
      const result = isValidChainId(999999);
      expect(result).toBe(false);
    });
  });

  describe('isValidChainName', () => {
    it('should return true for valid chain name', () => {
      const result = isValidChainName(mockChainName);
      expect(result).toBe(true);
    });

    it('should return false for invalid chain name', () => {
      const result = isValidChainName('invalid-chain');
      expect(result).toBe(false);
    });

    it('should narrow type when returning true', () => {
      const chainName = 'sepolia';
      if (isValidChainName(chainName)) {
        // TypeScript should now know this is ChainName
        expect(typeof chainName).toBe('string');
        expect(chainName).toBe(mockChainName);
      }
    });
  });

  describe('getAllChainIds', () => {
    it('should return array of all chain IDs', () => {
      const result = getAllChainIds();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain(mockChainId);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return unique chain IDs', () => {
      const result = getAllChainIds();
      const uniqueIds = new Set(result);
      expect(uniqueIds.size).toBe(result.length);
    });
  });

  describe('getAllChainNames', () => {
    it('should return array of all chain names', () => {
      const result = getAllChainNames();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain(mockChainName);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return unique chain names', () => {
      const result = getAllChainNames();
      const uniqueNames = new Set(result);
      expect(uniqueNames.size).toBe(result.length);
    });

    it('should return all chain names as ChainName type', () => {
      const result = getAllChainNames();
      result.forEach((chainName) => {
        expect(isValidChainName(chainName)).toBe(true);
      });
    });
  });

  describe('getChainMetadata', () => {
    it('should return metadata for valid chain name', () => {
      const result = getChainMetadata(mockChainName);
      expect(result).toBeDefined();
      expect(result.chainId).toBe(mockChainId);
      expect(result.explorer).toBeDefined();
      expect(result.nativeToken).toBeDefined();
    });

    it('should throw error for invalid chain name', () => {
      expect(() => getChainMetadata('invalid-chain' as ChainName)).toThrow(
        'Chain not found: invalid-chain'
      );
    });

    it('should return metadata with expected structure', () => {
      const result = getChainMetadata(mockChainName);
      expect(result).toHaveProperty('chainId');
      expect(result).toHaveProperty('explorer');
      expect(result).toHaveProperty('nativeToken');
      expect(typeof result.chainId).toBe('number');
      expect(typeof result.explorer).toBe('string');
      expect(typeof result.nativeToken).toBe('string');
    });
  });

  describe('getAllChainsMetadata', () => {
    it('should return array of all chains with metadata', () => {
      const result = getAllChainsMetadata();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return objects with name and metadata properties', () => {
      const result = getAllChainsMetadata();
      result.forEach((chain) => {
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('metadata');
        expect(typeof chain.name).toBe('string');
        expect(typeof chain.metadata).toBe('object');
      });
    });

    it('should return metadata for each chain', () => {
      const result = getAllChainsMetadata();
      result.forEach((chain) => {
        expect(chain.metadata).toHaveProperty('chainId');
        expect(chain.metadata).toHaveProperty('explorer');
        expect(chain.metadata).toHaveProperty('nativeToken');
      });
    });

    it('should return all available chains', () => {
      const result = getAllChainsMetadata();
      const expectedChainNames = Object.keys(chains);
      expect(result.length).toBe(expectedChainNames.length);

      const resultNames = result.map((chain) => chain.name);
      expectedChainNames.forEach((expectedName) => {
        expect(resultNames).toContain(expectedName);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between different getter functions', () => {
      const chainNames = getAllChainNames();
      const chainIds = getAllChainIds();
      const chainsMetadata = getAllChainsMetadata();

      expect(chainNames.length).toBe(chainIds.length);
      expect(chainNames.length).toBe(chainsMetadata.length);

      chainNames.forEach((chainName, index) => {
        const chainId = getChainId(chainName);
        const metadata = getChainMetadata(chainName);
        const foundMetadata = chainsMetadata.find((cm) => cm.name === chainName);

        expect(chainIds).toContain(chainId);
        expect(metadata.chainId).toBe(chainId);
        expect(foundMetadata).toBeDefined();
        expect(foundMetadata?.metadata.chainId).toBe(chainId);
      });
    });

    it('should handle all chains in the chains object', () => {
      const chainsEntries = Object.entries(chains);
      const chainNames = getAllChainNames();
      const chainsMetadata = getAllChainsMetadata();

      expect(chainNames.length).toBe(chainsEntries.length);
      expect(chainsMetadata.length).toBe(chainsEntries.length);

      chainsEntries.forEach(([name, config]) => {
        expect(chainNames).toContain(name);
        expect(isValidChainName(name)).toBe(true);

        const foundMetadata = chainsMetadata.find((cm) => cm.name === name);
        expect(foundMetadata).toBeDefined();
        expect(foundMetadata?.metadata).toEqual(config.metadata);
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', () => {
      const invalidChainName = 'non-existent-chain' as ChainName;
      const invalidChainId = 999999 as ChainId;

      expect(() => getChainId(invalidChainName)).toThrow(/Chain not found/);
      expect(() => getChainNameById(invalidChainId)).toThrow(/Chain ID not found/);
      expect(() => getChainMetadata(invalidChainName)).toThrow(/Chain not found/);
    });

    it('should handle edge cases gracefully', () => {
      // Test with empty string
      expect(isValidChainName('')).toBe(false);

      // Test with null/undefined (if allowed by types)
      expect(isValidChainId(0)).toBe(false);

      // Test with very large numbers
      expect(isValidChainId(Number.MAX_SAFE_INTEGER)).toBe(false);
    });
  });
});
