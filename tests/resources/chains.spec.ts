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
      const validChainNames: ChainName[] = ['sepolia', 'mainnet'];
      expect(validChainNames).toContain('sepolia');
      expect(validChainNames).toContain('mainnet');
    });

    it('should have correct ChainId type', () => {
      const validChainIds: ChainId[] = [11155111, 1];
      expect(validChainIds).toContain(11155111);
      expect(validChainIds).toContain(1);
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

    it('should have mainnet chain configuration', () => {
      expect(chains.mainnet).toBeDefined();
      expect(chains.mainnet.metadata.chainId).toBe(1);
      expect(chains.mainnet.metadata.explorer).toBe('https://etherscan.io');
      expect(chains.mainnet.contracts.factory).toBeDefined();
      expect(chains.mainnet.contracts.dao).toBeDefined();
    });
  });

  describe('getChainId function', () => {
    it('should return correct chain ID for sepolia', () => {
      const chainId = getChainId('sepolia');
      expect(chainId).toBe(11155111);
    });

    it('should return correct chain ID for mainnet', () => {
      const chainId = getChainId('mainnet');
      expect(chainId).toBe(1);
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

    it('should return correct chain name for mainnet chain ID', () => {
      const chainName = getChainNameById(1);
      expect(chainName).toBe('mainnet');
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

    it('should ensure all chains have the same contracts', () => {
      const sepoliaContracts = Object.keys(chains.sepolia.contracts);
      const mainnetContracts = Object.keys(chains.mainnet.contracts);

      expect(sepoliaContracts).toEqual(mainnetContracts);
    });
  });

  describe('isValidChainId function', () => {
    it('should return true for valid chain IDs', () => {
      expect(isValidChainId(11155111)).toBe(true);
      expect(isValidChainId(1)).toBe(true);
    });

    it('should return false for invalid chain IDs', () => {
      expect(isValidChainId(999999)).toBe(false);
      expect(isValidChainId(0)).toBe(false);
    });
  });

  describe('isValidChainName function', () => {
    it('should return true for valid chain names', () => {
      expect(isValidChainName('sepolia')).toBe(true);
      expect(isValidChainName('mainnet')).toBe(true);
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
      expect(chainIds).toContain(1);
      expect(chainIds.length).toBe(2);
    });
  });

  describe('getAllChainNames function', () => {
    it('should return all supported chain names', () => {
      const chainNames = getAllChainNames();
      expect(chainNames).toContain('sepolia');
      expect(chainNames).toContain('mainnet');
      expect(chainNames.length).toBe(2);
    });
  });
});
