import { OverrideVoteCastListener } from '@listeners';
import { EvexGovernanceContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('OverrideVoteCastListener', () => {
  let listener: OverrideVoteCastListener;
  let mockGovernanceContract: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockGovernanceContract = {
      instance: {
        filters: {
          OverrideVoteCast: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(EvexGovernanceContract, mockGovernanceContract);
    listener = container.resolve(OverrideVoteCastListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockGovernanceContract.instance.filters.OverrideVoteCast).toHaveBeenCalled();
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockGovernanceContract.instance.removeAllListeners).toHaveBeenCalledWith('OverrideVoteCast');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [
          '0x1234567890123456789012345678901234567890', // voter
          BigInt(123), // proposalId
          1, // support (1 = for, 0 = against)
          BigInt(1000), // weight
          'I override this vote' // reason
        ],
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
        voter: '0x1234567890123456789012345678901234567890',
        proposalId: 123n,
        support: 1,
        weight: 1000n,
        reason: 'I override this vote',
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

    await capturedHandler(
      '0x1234567890123456789012345678901234567890',
      BigInt(123),
      1,
      BigInt(1000),
      'I override this vote',
      mockEvent
    );

    expect(consoleSpy).toHaveBeenCalledWith('Error in OverrideVoteCast event callback:', expect.any(Error));
    
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

    await capturedHandler(
      '0x1234567890123456789012345678901234567890',
      BigInt(123),
      1,
      BigInt(1000),
      'I override this vote',
      mockEvent
    );

    expect(callback1).toHaveBeenCalledWith({
      voter: '0x1234567890123456789012345678901234567890',
      proposalId: 123n,
      support: 1,
      weight: 1000n,
      reason: 'I override this vote',
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      voter: '0x1234567890123456789012345678901234567890',
      proposalId: 123n,
      support: 1,
      weight: 1000n,
      reason: 'I override this vote',
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
    await capturedHandler(
      '0x0987654321098765432109876543210987654321',
      BigInt(456),
      0,
      BigInt(500),
      'I override with opposition',
      mockEvent
    );

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      voter: '0x0987654321098765432109876543210987654321',
      proposalId: 456n,
      support: 0,
      weight: 500n,
      reason: 'I override with opposition',
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

    // Should only call the filter and on methods once
    expect(mockGovernanceContract.instance.filters.OverrideVoteCast).toHaveBeenCalledTimes(1);
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledTimes(1);
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

  it('should handle multiple historical events', async () => {
    const mockEvents = [
      {
        args: [
          '0x1234567890123456789012345678901234567890',
          BigInt(123),
          1,
          BigInt(1000),
          'First override vote'
        ],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      },
      {
        args: [
          '0x0987654321098765432109876543210987654321',
          BigInt(456),
          0,
          BigInt(500),
          'Second override vote'
        ],
        blockNumber: 12346,
        transactionHash: '0xdef',
        index: 1
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      voter: '0x1234567890123456789012345678901234567890',
      proposalId: 123n,
      support: 1,
      weight: 1000n,
      reason: 'First override vote',
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(result[1]).toEqual({
      voter: '0x0987654321098765432109876543210987654321',
      proposalId: 456n,
      support: 0,
      weight: 500n,
      reason: 'Second override vote',
      blockNumber: 12346,
      transactionHash: '0xdef',
      logIndex: 1
    });
  });

  it('should handle empty historical events', async () => {
    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue([]);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(result).toEqual([]);
  });

  it('should handle override vote with empty reason', async () => {
    const mockEvents = [
      {
        args: [
          '0x1234567890123456789012345678901234567890',
          BigInt(123),
          1,
          BigInt(1000),
          '' // Empty reason
        ],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(result[0]).toEqual({
      voter: '0x1234567890123456789012345678901234567890',
      proposalId: 123n,
      support: 1,
      weight: 1000n,
      reason: '',
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
  });

  it('should handle override vote with zero weight', async () => {
    const mockEvents = [
      {
        args: [
          '0x1234567890123456789012345678901234567890',
          BigInt(123),
          1,
          BigInt(0), // Zero weight
          'Override with zero weight'
        ],
        blockNumber: 12345,
        transactionHash: '0xabc',
        index: 0
      }
    ];

    (mockGovernanceContract.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(12000, 13000);

    expect(result[0]).toEqual({
      voter: '0x1234567890123456789012345678901234567890',
      proposalId: 123n,
      support: 1,
      weight: 0n,
      reason: 'Override with zero weight',
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
  });
}); 