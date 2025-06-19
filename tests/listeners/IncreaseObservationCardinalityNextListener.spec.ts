import { IncreaseObservationCardinalityNextListener } from '@listeners';
import { PoolContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('IncreaseObservationCardinalityNextListener', () => {
  let listener: IncreaseObservationCardinalityNextListener;
  let mockPoolContract: jest.Mocked<PoolContract>;

  beforeEach(() => {
    container.clearInstances();
    const mockFilter = { filter: 'mock' };
    mockPoolContract = {
      instance: {
        filters: {
          IncreaseObservationCardinalityNext: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;
    container.registerInstance(PoolContract, mockPoolContract);
    listener = container.resolve(IncreaseObservationCardinalityNextListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    expect(mockPoolContract.instance.filters.IncreaseObservationCardinalityNext).toHaveBeenCalled();
    expect(mockPoolContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback);
    listener.stop();
    expect(mockPoolContract.instance.removeAllListeners).toHaveBeenCalledWith('IncreaseObservationCardinalityNext');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [10, 20],
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
        observationCardinalityNextOld: 10,
        observationCardinalityNextNew: 20,
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
    await capturedHandler(10, 20, mockEvent);
    expect(consoleSpy).toHaveBeenCalledWith('Error in IncreaseObservationCardinalityNext event callback:', expect.any(Error));
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
    await capturedHandler(10, 20, mockEvent);
    expect(callback1).toHaveBeenCalledWith({
      observationCardinalityNextOld: 10,
      observationCardinalityNextNew: 20,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      observationCardinalityNextOld: 10,
      observationCardinalityNextNew: 20,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    listener.removeCallback(callback1);
    callback1.mockClear();
    callback2.mockClear();
    await capturedHandler(30, 40, mockEvent);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      observationCardinalityNextOld: 30,
      observationCardinalityNextNew: 40,
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
    expect(mockPoolContract.instance.filters.IncreaseObservationCardinalityNext).toHaveBeenCalledTimes(1);
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
      { args: [10, 20], blockNumber: 12345, transactionHash: '0xabc', index: 0 },
      { args: [30, 40], blockNumber: 12346, transactionHash: '0xdef', index: 1 }
    ];
    (mockPoolContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);
    const result = await listener.getHistoricalEvents(12000, 13000);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      observationCardinalityNextOld: 10,
      observationCardinalityNextNew: 20,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(result[1]).toEqual({
      observationCardinalityNextOld: 30,
      observationCardinalityNextNew: 40,
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