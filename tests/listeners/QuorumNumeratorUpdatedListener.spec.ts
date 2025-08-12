import { QuorumNumeratorUpdatedListener } from '@listeners';
import { EvxGovernanceContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('QuorumNumeratorUpdatedListener', () => {
  let listener: QuorumNumeratorUpdatedListener;
  let mockGovernanceContract: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockGovernanceContract = {
      instance: {
        filters: {
          QuorumNumeratorUpdated: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(EvxGovernanceContract, mockGovernanceContract);
    listener = container.resolve(QuorumNumeratorUpdatedListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockGovernanceContract.instance.filters.QuorumNumeratorUpdated).toHaveBeenCalled();
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockGovernanceContract.instance.removeAllListeners).toHaveBeenCalledWith('QuorumNumeratorUpdated');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [BigInt(100), BigInt(150)], // oldQuorumNumerator, newQuorumNumerator
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(mockGovernanceContract.instance.queryFilter).toHaveBeenCalledWith(expect.any(Object), 12000, 13000);
    expect(result).toEqual([
      {
        oldQuorumNumerator: 100n,
        newQuorumNumerator: 150n,
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
    (mockGovernanceContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
      capturedHandler = handler;
    });

    await listener.start(callback);

    // Simulate event by calling the captured handler
    const mockEvent = {
      blockNumber: 12345,
      transactionHash: '0xabc',
      index: 0
    };

    await capturedHandler(BigInt(100), BigInt(150), mockEvent);

    expect(consoleSpy).toHaveBeenCalledWith('Error in QuorumNumeratorUpdated event callback:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should add and remove callbacks correctly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Mock the on method to capture the event handler
    let capturedHandler: any;
    (mockGovernanceContract.instance.on as jest.Mock).mockImplementation((filter: any, handler: any) => {
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

    await capturedHandler(BigInt(100), BigInt(150), mockEvent);

    expect(callback1).toHaveBeenCalledWith({
      oldQuorumNumerator: 100n,
      newQuorumNumerator: 150n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      oldQuorumNumerator: 100n,
      newQuorumNumerator: 150n,
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
    await capturedHandler(BigInt(150), BigInt(200), mockEvent);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      oldQuorumNumerator: 150n,
      newQuorumNumerator: 200n,
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

    // Should only call on once
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledTimes(1);
    expect(listener.listening).toBe(true);
  });

  it('should handle invalid event format in getHistoricalEvents', async () => {
    const mockEvents = [
      {
        // Missing args property
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    await expect(listener.getHistoricalEvents(12000, 13000)).rejects.toThrow('Invalid event format');
  });

  it('should clear callbacks when stopping', async () => {
    const callback = jest.fn();
    await listener.start(callback);

    listener.stop();

    expect(listener.listening).toBe(false);
    // Try to add a callback after stopping
    listener.addCallback(callback);
    expect(listener.listening).toBe(false);
  });

  it('should handle multiple historical events', async () => {
    const mockEvents = [
      {
        args: [BigInt(100), BigInt(150)],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      },
      {
        args: [BigInt(150), BigInt(200)],
        blockNumber: 12346,
        transactionHash: '0xdef',
        index: 1
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(result).toEqual([
      {
        oldQuorumNumerator: 100n,
        newQuorumNumerator: 150n,
        blockNumber: 12345,
        transactionHash: '0xabc',
        logIndex: 0
      },
      {
        oldQuorumNumerator: 150n,
        newQuorumNumerator: 200n,
        blockNumber: 12346,
        transactionHash: '0xdef',
        logIndex: 1
      }
    ]);
  });
}); 