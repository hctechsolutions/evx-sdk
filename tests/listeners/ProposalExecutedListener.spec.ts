import { ProposalExecutedListener } from '@listeners';
import { NebularGovernanceContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('ProposalExecutedListener', () => {
  let listener: ProposalExecutedListener;
  let mockGovernanceContract: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockGovernanceContract = {
      instance: {
        filters: {
          ProposalExecuted: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(NebularGovernanceContract, mockGovernanceContract);
    listener = container.resolve(ProposalExecutedListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockGovernanceContract.instance.filters.ProposalExecuted).toHaveBeenCalled();
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockGovernanceContract.instance.removeAllListeners).toHaveBeenCalledWith('ProposalExecuted');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [BigInt(123)],
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
        proposalId: 123n,
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

    await capturedHandler(BigInt(123), mockEvent);

    expect(consoleSpy).toHaveBeenCalledWith('Error in ProposalExecuted event callback:', expect.any(Error));
    
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

    await capturedHandler(BigInt(123), mockEvent);

    expect(callback1).toHaveBeenCalledWith({
      proposalId: 123n,
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      proposalId: 123n,
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
    await capturedHandler(BigInt(456), mockEvent);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      proposalId: 456n,
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
}); 