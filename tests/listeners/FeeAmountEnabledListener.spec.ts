import { FeeAmountEnabledListener } from '@listeners';
import { FactoryContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('FeeAmountEnabledListener', () => {
  let listener: FeeAmountEnabledListener;
  let mockFactoryContract: jest.Mocked<FactoryContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockFactoryContract = {
      instance: {
        filters: {
          FeeAmountEnabled: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(FactoryContract, mockFactoryContract);
    listener = container.resolve(FeeAmountEnabledListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockFactoryContract.instance.filters.FeeAmountEnabled).toHaveBeenCalled();
    expect(mockFactoryContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockFactoryContract.instance.removeAllListeners).toHaveBeenCalledWith('FeeAmountEnabled');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [BigInt(3000), BigInt(60)],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];

    (mockFactoryContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(mockFactoryContract.instance.queryFilter).toHaveBeenCalledWith(expect.any(Object), 12000, 13000);
    expect(result).toEqual([
      {
        fee: 3000n,
        tickSpacing: 60n,
        blockNumber: 12345,
        transactionHash: '0xabc',
        logIndex: 0
      }
    ]);
  });

  it('should handle callback errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const callback = jest.fn().mockRejectedValue(new Error('Callback error'));

    // Mock the on method to capture the event handler
    let capturedHandler: any;
    (mockFactoryContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });

    await listener.start(callback);

    // Simulate event by calling the captured handler
    const mockEvent = {
      blockNumber: 12345,
      transactionHash: '0xabc',
      index: 0
    };

    await capturedHandler(BigInt(3000), BigInt(60), mockEvent);

    expect(consoleSpy).toHaveBeenCalledWith('Error in FeeAmountEnabled event callback:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should add and remove callbacks correctly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Mock the on method to capture the event handler
    let capturedHandler: any;
    (mockFactoryContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });

    // Start listening and add callbacks
    await listener.start(callback1);
    listener.addCallback(callback2);

    // Simulate event
    const mockEvent = {
      blockNumber: 12345,
      transactionHash: '0xabc',
      index: 0
    };

    await capturedHandler(BigInt(3000), BigInt(60), mockEvent);

    expect(callback1).toHaveBeenCalledWith({
      fee: 3000n,
      tickSpacing: 60n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      fee: 3000n,
      tickSpacing: 60n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });

    // Remove callback1
    listener.removeCallback(callback1);

    // Reset mocks
    callback1.mockClear();
    callback2.mockClear();

    // Simulate another event
    await capturedHandler(BigInt(500), BigInt(10), {
      blockNumber: 12346,
      transactionHash: '0xdef',
      index: 1
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      fee: 500n,
      tickSpacing: 10n,
      blockNumber: 12346,
      transactionHash: '0xdef',
      logIndex: 1
    });
  });
}); 