import { CreateOrderCommand } from '@commands/order/CreateOrderCommand';
import { OrderExecutorContract } from '@contracts';
import { ICreateOrderCommandParams } from '@interfaces/commands/params/ICreateOrderCommandParams';
import { container } from 'tsyringe';

describe('CreateOrderCommand', () => {
  let createOrderCommand: CreateOrderCommand;
  let orderExecutorContract: OrderExecutorContract;

  beforeEach(() => {
    createOrderCommand = container.resolve(CreateOrderCommand);
    orderExecutorContract = container.resolve(OrderExecutorContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an order successfully', async () => {
      // Arrange
      const mockReceipt = {
        hash: '0x1234567890abcdef',
        logs: [
          {
            address: '0x0000000000000000000000000000000000000000',
            topics: [
              '0x...', // OrderCreated event signature
              '0x...', // user address
              '0x...' // orderId
            ],
            data: '0x'
          }
        ]
      };

      const mockTransaction = {
        hash: '0x1234567890abcdef',
        wait: jest.fn().mockResolvedValue(mockReceipt)
      };

      const mockParsedEvent = {
        name: 'OrderCreated',
        args: {
          user: '0x1234567890123456789012345678901234567890',
          orderId: BigInt(1)
        }
      };

      jest
        .spyOn(orderExecutorContract.instance, 'createOrder')
        .mockResolvedValue(mockTransaction as any);
      const parseLogMock = jest
        .spyOn(orderExecutorContract.instance.interface, 'parseLog')
        .mockReturnValue(mockParsedEvent as any);

      const params: ICreateOrderCommandParams = {
        tokenIn: '0x1234567890123456789012345678901234567890',
        tokenOut: '0x0987654321098765432109876543210987654321',
        fee: 3000,
        recipient: '0x1111111111111111111111111111111111111111',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: BigInt('1000000000000000000'),
        amountOutMinimum: BigInt('950000000000000000'),
        sqrtPriceLimitX96: BigInt('0'),
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn()
      };

      // Act
      const result = await createOrderCommand.execute(params);

      // Assert
      expect(orderExecutorContract.instance.createOrder).toHaveBeenCalledWith({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee,
        recipient: params.recipient,
        deadline: params.deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96
      });

      expect(mockTransaction.wait).toHaveBeenCalled();
      expect(parseLogMock).toHaveBeenCalled();
      expect(params.onTransaction).toHaveBeenCalledWith('0x1234567890abcdef');
      expect(params.onDone).toHaveBeenCalledWith(mockReceipt);
      expect(result).toEqual({
        orderId: BigInt(1)
      });
    });

    it('should handle errors and call onFail callback', async () => {
      // Arrange
      const error = new Error('Transaction failed');
      jest.spyOn(orderExecutorContract.instance, 'createOrder').mockRejectedValue(error);

      const params: ICreateOrderCommandParams = {
        tokenIn: '0x1234567890123456789012345678901234567890',
        tokenOut: '0x0987654321098765432109876543210987654321',
        fee: 3000,
        recipient: '0x1111111111111111111111111111111111111111',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: BigInt('1000000000000000000'),
        amountOutMinimum: BigInt('950000000000000000'),
        sqrtPriceLimitX96: BigInt('0'),
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn()
      };

      // Act & Assert
      await expect(createOrderCommand.execute(params)).rejects.toThrow('Transaction failed');
      expect(params.onFail).toHaveBeenCalledWith(error);
      expect(params.onTransaction).not.toHaveBeenCalled();
      expect(params.onDone).not.toHaveBeenCalled();
    });

    it('should throw error when OrderCreated event is not found', async () => {
      // Arrange
      const mockReceipt = {
        hash: '0x1234567890abcdef',
        logs: []
      };

      const mockTransaction = {
        hash: '0x1234567890abcdef',
        wait: jest.fn().mockResolvedValue(mockReceipt)
      };

      jest
        .spyOn(orderExecutorContract.instance, 'createOrder')
        .mockResolvedValue(mockTransaction as any);
      jest.spyOn(orderExecutorContract.instance.interface, 'parseLog').mockImplementation(() => {
        throw new Error('Event not found');
      });

      const params: ICreateOrderCommandParams = {
        tokenIn: '0x1234567890123456789012345678901234567890',
        tokenOut: '0x0987654321098765432109876543210987654321',
        fee: 3000,
        recipient: '0x1111111111111111111111111111111111111111',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: BigInt('1000000000000000000'),
        amountOutMinimum: BigInt('950000000000000000'),
        sqrtPriceLimitX96: BigInt('0'),
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn()
      };

      // Act & Assert
      await expect(createOrderCommand.execute(params)).rejects.toThrow(
        'OrderCreated event not found in transaction receipt'
      );
      expect(params.onTransaction).toHaveBeenCalledWith('0x1234567890abcdef');
      expect(params.onDone).not.toHaveBeenCalled();
      expect(params.onFail).toHaveBeenCalled();
    });
  });
});
