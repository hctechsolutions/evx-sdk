import { CreateLimitOrderCommand } from '@commands/limit-order';
import { LimitOrderExecutorContract } from '@contracts';
import { ICreateLimitOrderCommandParams } from '@interfaces/commands/params/ICreateLimitOrderCommandParams';

type MockMethod = jest.Mock & {
  staticCall?: jest.Mock;
};

describe('CreateLimitOrderCommand', () => {
  let command: CreateLimitOrderCommand;
  let mockLimitOrderExecutor: jest.Mocked<LimitOrderExecutorContract>;
  let mockParams: ICreateLimitOrderCommandParams;

  beforeEach(() => {
    const mockCreateLimitOrder = jest.fn() as MockMethod;
    const mockInterface = {
      parseLog: jest.fn()
    };

    mockLimitOrderExecutor = {
      instance: {
        createLimitOrder: mockCreateLimitOrder,
        interface: mockInterface
      },
    } as unknown as jest.Mocked<LimitOrderExecutorContract>;

    mockParams = {
      limitOrderParams: {
        tokenIn: '0xTokenIn',
        tokenOut: '0xTokenOut',
        amountIn: BigInt(1000000),
        minAmountOut: BigInt(900000),
        fee: 3000,
        targetPrice: BigInt(1500),
        deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
        sqrtPriceLimitX96: BigInt(0)
      },
      gelatoFee: BigInt(100000),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    command = new CreateLimitOrderCommand(mockLimitOrderExecutor);
  });

  it('should execute create limit order successfully', async () => {
    const fakeOrderId = '0x123456789abcdef';
    const fakeTx = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xFAKE_TX_HASH',
        logs: [{
          address: '0xContractAddress',
          topics: ['0xEventTopic'],
          data: '0xEventData'
        }]
      })
    };

    const mockMethod = mockLimitOrderExecutor.instance.createLimitOrder as unknown as MockMethod;
    mockMethod.mockResolvedValue(fakeTx);
    
    (mockLimitOrderExecutor.instance.interface.parseLog as jest.Mock).mockReturnValue({
      name: 'LimitOrderCreated',
      args: { orderId: fakeOrderId }
    });

    const result = await command.execute(mockParams);

    expect(mockLimitOrderExecutor.instance.createLimitOrder).toHaveBeenCalledWith(
      mockParams.limitOrderParams,
      { value: mockParams.gelatoFee }
    );
    expect(mockParams.onTransaction).toHaveBeenCalledWith(fakeTx.hash);
    expect(fakeTx.wait).toHaveBeenCalled();
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(result).toBe(fakeOrderId);
  });

  it('should handle missing LimitOrderCreated event', async () => {
    const fakeTx = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xFAKE_TX_HASH',
        logs: []
      })
    };

    const mockMethod = mockLimitOrderExecutor.instance.createLimitOrder as unknown as MockMethod;
    mockMethod.mockResolvedValue(fakeTx);
    (mockLimitOrderExecutor.instance.interface.parseLog as jest.Mock).mockReturnValue(null);

    await expect(command.execute(mockParams)).rejects.toThrow('LimitOrderCreated event not found in transaction receipt');
    expect(mockParams.onFail).toHaveBeenCalled();
  });

  it('should handle transaction failure', async () => {
    const error = new Error('Transaction failed');
    const mockMethod = mockLimitOrderExecutor.instance.createLimitOrder as unknown as MockMethod;
    mockMethod.mockRejectedValue(error);

    await expect(command.execute(mockParams)).rejects.toThrow('Transaction failed');
    expect(mockParams.onFail).toHaveBeenCalledWith(error);
  });

  it('should use default gelato fee when not provided', async () => {
    const paramsWithoutFee = { ...mockParams };
    delete paramsWithoutFee.gelatoFee;

    const fakeOrderId = '0x123456789abcdef';
    const fakeTx = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xFAKE_TX_HASH',
        logs: [{
          address: '0xContractAddress',
          topics: ['0xEventTopic'],
          data: '0xEventData'
        }]
      })
    };

    const mockMethod = mockLimitOrderExecutor.instance.createLimitOrder as unknown as MockMethod;
    mockMethod.mockResolvedValue(fakeTx);
    (mockLimitOrderExecutor.instance.interface.parseLog as jest.Mock).mockReturnValue({
      name: 'LimitOrderCreated',
      args: { orderId: fakeOrderId }
    });

    await command.execute(paramsWithoutFee);

    expect(mockLimitOrderExecutor.instance.createLimitOrder).toHaveBeenCalledWith(
      paramsWithoutFee.limitOrderParams,
      { value: 0n }
    );
  });
});
