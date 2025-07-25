import { CancelOrderCommand } from '@commands/order/CancelOrderCommand';
import { OrderExecutorContract } from '@contracts';
import { ICancelOrderCommandParams } from '@interfaces/commands/params/ICancelOrderCommandParams';
import { container } from 'tsyringe';

describe('CancelOrderCommand', () => {
  let cancelOrderCommand: CancelOrderCommand;
  let orderExecutorContract: OrderExecutorContract;

  beforeEach(() => {
    cancelOrderCommand = container.resolve(CancelOrderCommand);
    orderExecutorContract = container.resolve(OrderExecutorContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should cancel an order successfully', async () => {
      // Arrange
      const mockReceipt = {
        hash: '0x1234567890abcdef'
      };

      const mockTransaction = {
        hash: '0x1234567890abcdef',
        wait: jest.fn().mockResolvedValue(mockReceipt)
      };

      jest
        .spyOn(orderExecutorContract.instance, 'cancelOrder')
        .mockResolvedValue(mockTransaction as any);

      const params: ICancelOrderCommandParams = {
        orderId: BigInt(1),
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn()
      };

      // Act
      const result = await cancelOrderCommand.execute(params);

      // Assert
      expect(orderExecutorContract.instance.cancelOrder).toHaveBeenCalledWith(BigInt(1));
      expect(mockTransaction.wait).toHaveBeenCalled();
      expect(params.onTransaction).toHaveBeenCalledWith('0x1234567890abcdef');
      expect(params.onDone).toHaveBeenCalledWith(mockReceipt);
      expect(result).toEqual({
        cancelled: true
      });
    });

    it('should handle errors and call onFail callback', async () => {
      // Arrange
      const error = new Error('Transaction failed');
      jest.spyOn(orderExecutorContract.instance, 'cancelOrder').mockRejectedValue(error);

      const params: ICancelOrderCommandParams = {
        orderId: BigInt(1),
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn()
      };

      // Act & Assert
      await expect(cancelOrderCommand.execute(params)).rejects.toThrow('Transaction failed');
      expect(params.onFail).toHaveBeenCalledWith(error);
      expect(params.onTransaction).not.toHaveBeenCalled();
      expect(params.onDone).not.toHaveBeenCalled();
    });
  });
}); 