import { LimitOrderCreatedListener } from '@listeners/limit-order';
import { LimitOrderExecutorContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('LimitOrderCreatedListener', () => {
  let listener: LimitOrderCreatedListener;
  let mockLimitOrderExecutor: jest.Mocked<LimitOrderExecutorContract>;

  beforeEach(() => {
    container.clearInstances();
    const mockFilter = { filter: 'mock' };
    const mockQueryFilter = jest.fn();
    mockLimitOrderExecutor = {
      instance: {
        filters: {
          LimitOrderCreated: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: mockQueryFilter
      }
    } as any;
    container.registerInstance(LimitOrderExecutorContract, mockLimitOrderExecutor);
    listener = container.resolve(LimitOrderCreatedListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    expect(mockLimitOrderExecutor.instance.filters.LimitOrderCreated).toHaveBeenCalled();
    expect(mockLimitOrderExecutor.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should add callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    listener.addCallback(callback1);
    listener.addCallback(callback2);
    
    expect(listener['callbacks']).toHaveLength(2);
    expect(listener['callbacks']).toContain(callback1);
    expect(listener['callbacks']).toContain(callback2);
  });

  it('should remove callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    listener.addCallback(callback1);
    listener.addCallback(callback2);
    listener.removeCallback(callback1);
    
    expect(listener['callbacks']).toHaveLength(1);
    expect(listener['callbacks']).toContain(callback2);
    expect(listener['callbacks']).not.toContain(callback1);
  });

  it('should stop listening', () => {
    listener['isListening'] = true;
    listener.stop();
    expect(mockLimitOrderExecutor.instance.removeAllListeners).toHaveBeenCalledWith('LimitOrderCreated');
    expect(listener.listening).toBe(false);
    expect(listener['callbacks']).toHaveLength(0);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [
          '0xOrderId1',
          '0xUser1',
          '0xTokenIn1',
          '0xTokenOut1',
          BigInt(1000),
          BigInt(900),
          3000,
          BigInt(1500),
          BigInt(1234567890),
          '0xTaskId1'
        ],
        blockNumber: 12345,
        transactionHash: '0xTxHash1',
        index: 0
      }
    ];

    (mockLimitOrderExecutor.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const events = await listener.getHistoricalEvents(12340, 12350);

    expect(mockLimitOrderExecutor.instance.filters.LimitOrderCreated).toHaveBeenCalled();
    expect(mockLimitOrderExecutor.instance.queryFilter).toHaveBeenCalledWith(expect.any(Object), 12340, 12350);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      orderId: '0xOrderId1',
      user: '0xUser1',
      tokenIn: '0xTokenIn1',
      tokenOut: '0xTokenOut1',
      amountIn: BigInt(1000),
      minAmountOut: BigInt(900),
      fee: 3000,
      targetPrice: BigInt(1500),
      deadline: BigInt(1234567890),
      taskId: '0xTaskId1',
      blockNumber: 12345,
      transactionHash: '0xTxHash1',
      logIndex: 0
    });
  });

  it('should handle invalid event format in historical events', async () => {
    const mockEvents = [{ invalidEvent: true }];
    (mockLimitOrderExecutor.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    await expect(listener.getHistoricalEvents(12340, 12350)).rejects.toThrow('Invalid event format');
  });
});
