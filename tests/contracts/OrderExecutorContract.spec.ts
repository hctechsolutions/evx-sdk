import { OrderExecutorContract } from '@contracts';
import { RPC } from '@providers';
import { container } from 'tsyringe';

describe('OrderExecutorContract', () => {
  let orderExecutorContract: OrderExecutorContract;
  let rpc: RPC;

  beforeEach(() => {
    orderExecutorContract = container.resolve(OrderExecutorContract);
    rpc = container.resolve(RPC);
  });

  describe('constructor', () => {
    it('should create an instance with correct properties', () => {
      // Assert
      expect(orderExecutorContract).toBeInstanceOf(OrderExecutorContract);
      expect(orderExecutorContract.name).toBe('orderExecutor');
      expect(orderExecutorContract.rpc).toBe(rpc);
      expect(orderExecutorContract.instance).toBeDefined();
    });
  });

  describe('getAddress', () => {
    it('should return the correct address for sepolia', () => {
      // Arrange
      orderExecutorContract.setChain('sepolia');

      // Act
      const address = orderExecutorContract.getAddress();

      // Assert
      expect(address).toBe('0x7fC548F0d27f7D6aAC90d2923b7c0EdF2c8198f2');
    });

    it('should throw error for unsupported chain', () => {
      // Act & Assert
      expect(() => {
        orderExecutorContract.setChain('unsupported' as any);
        orderExecutorContract.getAddress();
      }).toThrow('Chain not found: unsupported');
    });
  });

  describe('setSigner', () => {
    it('should set signer correctly', async () => {
      // Arrange
      orderExecutorContract.setChain('sepolia');
      const mockSigner = {
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      } as any;

      // Act
      await orderExecutorContract.setSigner(mockSigner);

      // Assert
      expect(orderExecutorContract.signer).toBe(mockSigner);
    });

    it('should remove signer when null is passed', async () => {
      // Arrange
      orderExecutorContract.setChain('sepolia');
      const mockSigner = {
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      } as any;

      await orderExecutorContract.setSigner(mockSigner);

      // Act
      await orderExecutorContract.setSigner(null);

      // Assert
      expect(orderExecutorContract.signer).toBeNull();
    });
  });

  describe('contract functions', () => {
    it('should have cancelOrder function', () => {
      // Assert
      expect(orderExecutorContract.instance.cancelOrder).toBeDefined();
    });

    it('should have createOrder function', () => {
      // Assert
      expect(orderExecutorContract.instance.createOrder).toBeDefined();
    });
  });
});
