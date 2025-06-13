import 'reflect-metadata';
import { ethers } from 'ethers';
import { BaseContract } from '../../src/contracts/BaseContract';
import { RPC } from '../../src/providers/RPC';
import { container } from 'tsyringe';

// Mock the chains resource
jest.mock('@resources', () => ({
  chains: {
    sepolia: {
      factory: '0x1234567890123456789012345678901234567890',
      pool: '0x2345678901234567890123456789012345678901',
      positionManager: '0x3456789012345678901234567890123456789012'
    }
  },
  ChainName: {
    SEPOLIA: 'sepolia'
  },
  ContractName: {
    FACTORY: 'factory',
    POOL: 'pool',
    POSITION_MANAGER: 'positionManager'
  }
}));

// Create a concrete class for testing
class TestContract extends BaseContract {
  constructor(rpc: RPC) {
    super('factory', rpc, []);
  }
}

describe('BaseContract', () => {
  let mockProvider: jest.Mocked<ethers.JsonRpcProvider>;
  let mockSigner: jest.Mocked<ethers.Signer>;
  let rpc: RPC;
  let contract: TestContract;

  beforeEach(() => {
    mockProvider = {
      getNetwork: jest.fn(),
      getBlockNumber: jest.fn(),
      getBalance: jest.fn(),
      getCode: jest.fn(),
      getStorageAt: jest.fn(),
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getLogs: jest.fn(),
      estimateGas: jest.fn(),
      call: jest.fn(),
      sendTransaction: jest.fn(),
      getBlock: jest.fn(),
      getFeeData: jest.fn(),
      lookupAddress: jest.fn(),
      resolveName: jest.fn(),
      waitForTransaction: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      listenerCount: jest.fn(),
      listeners: jest.fn(),
      removeAllListeners: jest.fn(),
      removeListener: jest.fn(),
      addListener: jest.fn(),
      off: jest.fn()
    } as any;

    mockSigner = {
      getAddress: jest.fn(),
      signMessage: jest.fn(),
      signTransaction: jest.fn(),
      connect: jest.fn(),
      provider: mockProvider
    } as any;

    rpc = new RPC();
    rpc.provider = mockProvider;

    // Reset container and register RPC
    container.clearInstances();
    container.registerInstance(RPC, rpc);

    contract = new TestContract(rpc);
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(contract.name).toBe('factory');
      expect(contract.chain).toBe('sepolia');
      expect(contract.signer).toBeNull();
      expect(contract.rpc).toBe(rpc);
      expect(contract.instance).toBeInstanceOf(ethers.Contract);
    });
  });

  describe('setSigner', () => {
    it('should update signer and contract instance when signer is provided', async () => {
      await contract.setSigner(mockSigner);
      expect(contract.signer).toBe(mockSigner);
      expect(contract.instance).toBeInstanceOf(ethers.Contract);
    });

    it('should reset signer and contract instance when signer is null', async () => {
      await contract.setSigner(mockSigner);
      await contract.setSigner(null);
      expect(contract.signer).toBeNull();
      expect(contract.instance).toBeInstanceOf(ethers.Contract);
    });
  });

  describe('setChain', () => {
    it('should update chain and contract instance', () => {
      contract.setChain('sepolia');
      expect(contract.chain).toBe('sepolia');
      expect(contract.instance).toBeInstanceOf(ethers.Contract);
    });

    it('should throw error for invalid chain', () => {
      expect(() => contract.setChain('invalid' as any)).toThrow('Address not found for invalid.factory');
    });
  });

  describe('getAddress', () => {
    it('should return correct address for valid chain and contract', () => {
      const address = contract.getAddress();
      expect(address).toBe('0x1234567890123456789012345678901234567890');
    });
  });
}); 