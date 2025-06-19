import { CollectPositionListener } from '@listeners';
import { PositionManagerContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('CollectPositionListener', () => {
  let listener: CollectPositionListener;
  let mockContract: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    container.clearInstances();
    const mockFilter = { filter: 'mock' };
    mockContract = {
      instance: {
        filters: {
          Collect: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;
    container.registerInstance(PositionManagerContract, mockContract);
    listener = container.resolve(CollectPositionListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    expect(mockContract.instance.filters.Collect).toHaveBeenCalled();
    expect(mockContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    listener.stop();
    expect(mockContract.instance.removeAllListeners).toHaveBeenCalledWith('Collect');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [1n, '0xabc', 1000n, 2000n],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];
    (mockContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(mockContract.instance.queryFilter).toHaveBeenCalledWith(expect.any(Object), 12000, 13000);
    expect(result).toEqual([
      {
        tokenId: 1n,
        recipient: '0xabc',
        amount0: 1000n,
        amount1: 2000n,
        blockNumber: 12345,
        transactionHash: '0xabc',
        logIndex: 0
      }
    ]);
  });

  it('should handle callback errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const callback = jest.fn().mockRejectedValue(new Error('Callback error'));
    let capturedHandler: any;
    (mockContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });
    await listener.start(callback);
    const mockEvent = { blockNumber: 12345, transactionHash: '0xabc', index: 0 };
    await capturedHandler(1n, '0xabc', 1000n, 2000n, mockEvent);
    expect(consoleSpy).toHaveBeenCalledWith('Error in CollectPosition event callback:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should add and remove callbacks correctly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    let capturedHandler: any;
    (mockContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });
    await listener.start(callback1);
    listener.addCallback(callback2);
    const mockEvent = { blockNumber: 12345, transactionHash: '0xabc', index: 0 };
    await capturedHandler(1n, '0xabc', 1000n, 2000n, mockEvent);
    expect(callback1).toHaveBeenCalledWith({
      tokenId: 1n,
      recipient: '0xabc',
      amount0: 1000n,
      amount1: 2000n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      tokenId: 1n,
      recipient: '0xabc',
      amount0: 1000n,
      amount1: 2000n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    listener.removeCallback(callback1);
    callback1.mockClear();
    callback2.mockClear();
    await capturedHandler(2n, '0xdef', 2000n, 3000n, mockEvent);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      tokenId: 2n,
      recipient: '0xdef',
      amount0: 2000n,
      amount1: 3000n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
  });

  it('should not start listening if already listening', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    await listener.start(callback1);
    await listener.start(callback2);
    expect(mockContract.instance.filters.Collect).toHaveBeenCalledTimes(1);
    expect(mockContract.instance.on).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid event format in getHistoricalEvents', async () => {
    const mockEvents = [
      { blockNumber: 12345, transactionHash: '0xabc', index: 0 }
    ];
    (mockContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    await expect(listener.getHistoricalEvents(12000, 13000)).rejects.toThrow('Invalid event format');
  });

  it('should handle multiple historical events', async () => {
    const mockEvents = [
      { args: [1n, '0xabc', 1000n, 2000n], blockNumber: 12345, transactionHash: '0xabc', index: 0 },
      { args: [2n, '0xdef', 2000n, 3000n], blockNumber: 12346, transactionHash: '0xdef', index: 1 }
    ];
    (mockContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      tokenId: 1n, recipient: '0xabc', amount0: 1000n, amount1: 2000n, blockNumber: 12345, transactionHash: '0xabc', logIndex: 0
    });
    expect(result[1]).toEqual({
      tokenId: 2n, recipient: '0xdef', amount0: 2000n, amount1: 3000n, blockNumber: 12346, transactionHash: '0xdef', logIndex: 1
    });
  });

  it('should handle empty historical events', async () => {
    (mockContract.instance.queryFilter as jest.Mock).mockResolvedValue([]);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(result).toEqual([]);
  });
}); 