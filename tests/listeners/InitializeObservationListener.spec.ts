import { InitializeObservationListener } from '@listeners';
import { PoolContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('InitializeObservationListener', () => {
  let listener: InitializeObservationListener;
  let mockPoolContract: jest.Mocked<PoolContract>;

  beforeEach(() => {
    container.clearInstances();
    const mockFilter = { filter: 'mock' };
    mockPoolContract = {
      instance: {
        filters: {
          InitializeObservation: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;
    container.registerInstance(PoolContract, mockPoolContract);
    listener = container.resolve(InitializeObservationListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    expect(mockPoolContract.instance.filters.InitializeObservation).toHaveBeenCalled();
    expect(mockPoolContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    listener.stop();
    expect(mockPoolContract.instance.removeAllListeners).toHaveBeenCalledWith('InitializeObservation');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [1000000000000000000000n, 1000],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];
    (mockPoolContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(mockPoolContract.instance.queryFilter).toHaveBeenCalledWith(expect.any(Object), 12000, 13000);
    expect(result).toEqual([
      {
        sqrtPriceX96: 1000000000000000000000n,
        tick: 1000,
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
    (mockPoolContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });
    await listener.start(callback);
    const mockEvent = { blockNumber: 12345, transactionHash: '0xabc', index: 0 };
    await capturedHandler(1000000000000000000000n, 1000, mockEvent);
    expect(consoleSpy).toHaveBeenCalledWith('Error in InitializeObservation event callback:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should add and remove callbacks correctly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    let capturedHandler: any;
    (mockPoolContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });
    await listener.start(callback1);
    listener.addCallback(callback2);
    const mockEvent = { blockNumber: 12345, transactionHash: '0xabc', index: 0 };
    await capturedHandler(1000000000000000000000n, 1000, mockEvent);
    expect(callback1).toHaveBeenCalledWith({
      sqrtPriceX96: 1000000000000000000000n,
      tick: 1000,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      sqrtPriceX96: 1000000000000000000000n,
      tick: 1000,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    listener.removeCallback(callback1);
    callback1.mockClear();
    callback2.mockClear();
    await capturedHandler(2000000000000000000000n, 2000, mockEvent);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      sqrtPriceX96: 2000000000000000000000n,
      tick: 2000,
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
    expect(mockPoolContract.instance.filters.InitializeObservation).toHaveBeenCalledTimes(1);
    expect(mockPoolContract.instance.on).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid event format in getHistoricalEvents', async () => {
    const mockEvents = [
      { blockNumber: 12345, transactionHash: '0xabc', index: 0 }
    ];
    (mockPoolContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    await expect(listener.getHistoricalEvents(12000, 13000)).rejects.toThrow('Invalid event format');
  });

  it('should handle multiple historical events', async () => {
    const mockEvents = [
      { args: [1000000000000000000000n, 1000], blockNumber: 12345, transactionHash: '0xabc', index: 0 },
      { args: [2000000000000000000000n, 2000], blockNumber: 12346, transactionHash: '0xdef', index: 1 }
    ];
    (mockPoolContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      sqrtPriceX96: 1000000000000000000000n,
      tick: 1000,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(result[1]).toEqual({
      sqrtPriceX96: 2000000000000000000000n,
      tick: 2000,
      blockNumber: 12346,
      transactionHash: '0xdef',
      logIndex: 1
    });
  });

  it('should handle empty historical events', async () => {
    (mockPoolContract.instance.queryFilter as jest.Mock).mockResolvedValue([]);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(result).toEqual([]);
  });
}); 