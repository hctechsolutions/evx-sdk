import { chains } from '../../src/resources/chains';

describe('Chains Resources', () => {
  describe('chains object structure', () => {
    it('should have at least one chain defined', () => {
      expect(Object.keys(chains).length).toBeGreaterThan(0);
    });

    it('should have sepolia chain defined', () => {
      expect(chains).toHaveProperty('sepolia');
    });

    it('should have correct structure for each chain', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        expect(chainConfig).toHaveProperty('metadata');
        expect(chainConfig).toHaveProperty('contracts');

        expect(chainConfig.metadata).toHaveProperty('chainId');
        expect(chainConfig.metadata).toHaveProperty('explorer');
        expect(chainConfig.metadata).toHaveProperty('nativeToken');

        expect(chainConfig.contracts).toHaveProperty('positionDescriptor');
        expect(chainConfig.contracts).toHaveProperty('positionManager');
        expect(chainConfig.contracts).toHaveProperty('orderExecutor');
        expect(chainConfig.contracts).toHaveProperty('positionLens');
        expect(chainConfig.contracts).toHaveProperty('swapRouter');
        expect(chainConfig.contracts).toHaveProperty('swapQuoter');
        expect(chainConfig.contracts).toHaveProperty('pairFlash');
        expect(chainConfig.contracts).toHaveProperty('tickLens');
        expect(chainConfig.contracts).toHaveProperty('factory');
        expect(chainConfig.contracts).toHaveProperty('dao');
      });
    });
  });

  describe('sepolia chain configuration', () => {
    const sepoliaChain = chains.sepolia;

    it('should have correct chain ID', () => {
      expect(sepoliaChain.metadata.chainId).toBe(11155111);
    });

    it('should have valid explorer URL', () => {
      expect(sepoliaChain.metadata.explorer).toBe('https://sepolia.etherscan.io');
      expect(sepoliaChain.metadata.explorer).toMatch(/^https?:\/\/.+/);
    });

    it('should have valid native token address', () => {
      expect(sepoliaChain.metadata.nativeToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have valid contract addresses', () => {
      Object.entries(sepoliaChain.contracts).forEach(([contractName, address]) => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(typeof address).toBe('string');
        expect(address.length).toBe(42); // 0x + 40 hex chars
      });
    });

    it('should have unique contract addresses', () => {
      const addresses = Object.values(sepoliaChain.contracts);
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(addresses.length);
    });
  });

  describe('data validation', () => {
    it('should have valid chain IDs', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        const chainId = chainConfig.metadata.chainId;
        expect(typeof chainId).toBe('number');
        expect(chainId).toBeGreaterThan(0);
        expect(Number.isInteger(chainId)).toBe(true);
      });
    });

    it('should have valid explorer URLs', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        const explorer = chainConfig.metadata.explorer;
        expect(typeof explorer).toBe('string');
        expect(explorer).toMatch(/^https?:\/\/.+/);
        expect(explorer.length).toBeGreaterThan(0);
      });
    });

    it('should have valid native token addresses', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        const nativeToken = chainConfig.metadata.nativeToken;
        expect(typeof nativeToken).toBe('string');
        expect(nativeToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });

    it('should have valid contract addresses', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        Object.entries(chainConfig.contracts).forEach(([contractName, address]) => {
          expect(typeof address).toBe('string');
          expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(address.length).toBe(42);
        });
      });
    });
  });

  describe('consistency checks', () => {
    it('should have consistent data types across all chains', () => {
      const chainNames = Object.keys(chains);
      const firstChain = chains[chainNames[0] as keyof typeof chains];

      chainNames.forEach((chainName) => {
        const chain = chains[chainName as keyof typeof chains];
        expect(Object.keys(chain.metadata)).toEqual(Object.keys(firstChain.metadata));
        expect(Object.keys(chain.contracts)).toEqual(Object.keys(firstChain.contracts));
      });
    });

    it('should not have duplicate chain IDs', () => {
      const chainIds = Object.values(chains).map((chain) => chain.metadata.chainId);
      const uniqueChainIds = new Set(chainIds);
      expect(uniqueChainIds.size).toBe(chainIds.length);
    });

    it('should not have duplicate contract addresses within a chain', () => {
      Object.entries(chains).forEach(([chainName, chainConfig]) => {
        const addresses = Object.values(chainConfig.contracts);
        const uniqueAddresses = new Set(addresses);
        expect(uniqueAddresses.size).toBe(addresses.length);
      });
    });
  });

  describe('extensibility', () => {
    it('should allow adding new chains with same structure', () => {
      const newChain = {
        metadata: {
          chainId: 999999,
          explorer: 'https://example.com',
          nativeToken: '0x1234567890123456789012345678901234567890'
        },
        contracts: {
          positionDescriptor: '0x1234567890123456789012345678901234567890',
          positionManager: '0x1234567890123456789012345678901234567890',
          orderExecutor: '0x1234567890123456789012345678901234567890',
          positionLens: '0x1234567890123456789012345678901234567890',
          swapRouter: '0x1234567890123456789012345678901234567890',
          swapQuoter: '0x1234567890123456789012345678901234567890',
          pairFlash: '0x1234567890123456789012345678901234567890',
          tickLens: '0x1234567890123456789012345678901234567890',
          factory: '0x1234567890123456789012345678901234567890',
          dao: '0x1234567890123456789012345678901234567890'
        }
      };

      // This should not throw any errors
      expect(() => {
        const testChains = { ...chains, testChain: newChain };
        expect(testChains.testChain).toBeDefined();
        expect(testChains.testChain.metadata.chainId).toBe(999999);
      }).not.toThrow();
    });
  });
});
