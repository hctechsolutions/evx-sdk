import { chains } from '@resources';
import { ChainName, ChainId, ContractName } from '@interfaces';
import {
  getChainId,
  getChainNameById,
  isValidChainId,
  isValidChainName,
  getAllChainIds,
  getAllChainNames
} from '@utils';

describe('Chains Configuration', () => {
  describe('Type Definitions', () => {
    it('should have correct ChainName type', () => {
      const validChainNames: ChainName[] = ['sepolia'];
      expect(validChainNames).toContain('sepolia');
    });

    it('should have correct ChainId type', () => {
      const validChainIds: ChainId[] = [11155111];
      expect(validChainIds).toContain(11155111);
    });

    it('should have correct ContractName type', () => {
      const validContractNames: ContractName[] = [
        'positionDescriptor',
        'positionManager',
        'orderExecutor',
        'positionLens',
        'swapRouter',
        'swapQuoter',
        'pairFlash',
        'tickLens',
        'factory',
        'dao'
      ];

      expect(validContractNames).toContain('factory');
      expect(validContractNames).toContain('dao');
      expect(validContractNames).toContain('positionManager');
    });
  });

  describe('Chain Configuration', () => {
    it('should have sepolia chain configuration', () => {
      expect(chains.sepolia).toBeDefined();
      expect(chains.sepolia.metadata.chainId).toBe(11155111);
      expect(chains.sepolia.metadata.explorer).toBe('https://sepolia.etherscan.io');
      expect(chains.sepolia.contracts.factory).toBeDefined();
      expect(chains.sepolia.contracts.dao).toBeDefined();
    });
  });

  describe('getChainId function', () => {
    it('should return correct chain ID for sepolia', () => {
      const chainId = getChainId('sepolia');
      expect(chainId).toBe(11155111);
    });

    it('should throw error for invalid chain name', () => {
      expect(() => {
        getChainId('invalid' as ChainName);
      }).toThrow('Chain not found: invalid');
    });
  });

  describe('getChainNameById function', () => {
    it('should return correct chain name for sepolia chain ID', () => {
      const chainName = getChainNameById(11155111);
      expect(chainName).toBe('sepolia');
    });

    it('should throw error for invalid chain ID', () => {
      expect(() => {
        getChainNameById(999999 as ChainId);
      }).toThrow('Chain ID not found: 999999');
    });
  });

  describe('Type Safety', () => {
    it('should ensure chain IDs are unique', () => {
      const chainIds = Object.values(chains).map((chain) => chain.metadata.chainId);
      const uniqueChainIds = new Set(chainIds);
      expect(uniqueChainIds.size).toBe(chainIds.length);
    });

    it('should ensure all chains have required metadata', () => {
      Object.entries(chains).forEach(([_name, chain]) => {
        expect(chain.metadata).toBeDefined();
        expect(chain.metadata.chainId).toBeDefined();
        expect(chain.metadata.explorer).toBeDefined();
        expect(chain.contracts).toBeDefined();
      });
    });
  });

  describe('isValidChainId function', () => {
    it('should return true for valid chain IDs', () => {
      expect(isValidChainId(11155111)).toBe(true);
    });

    it('should return false for invalid chain IDs', () => {
      expect(isValidChainId(999999)).toBe(false);
      expect(isValidChainId(0)).toBe(false);
    });
  });

  describe('isValidChainName function', () => {
    it('should return true for valid chain names', () => {
      expect(isValidChainName('sepolia')).toBe(true);
    });

    it('should return false for invalid chain names', () => {
      expect(isValidChainName('invalid')).toBe(false);
      expect(isValidChainName('')).toBe(false);
    });
  });

  describe('getAllChainIds function', () => {
    it('should return all supported chain IDs', () => {
      const chainIds = getAllChainIds();
      expect(chainIds).toContain(11155111);
      expect(chainIds.length).toBe(1);
    });
  });

  describe('getAllChainNames function', () => {
    it('should return all supported chain names', () => {
      const chainNames = getAllChainNames();
      expect(chainNames).toContain('sepolia');
      expect(chainNames.length).toBe(1);
    });
  });
});
