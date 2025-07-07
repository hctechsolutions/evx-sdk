import { ProposalCreatedListener } from '@listeners';
import { EvexGovernanceContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('ProposalCreatedListener', () => {
  let listener: ProposalCreatedListener;
  let mockGovernanceContract: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockGovernanceContract = {
      instance: {
        filters: {
          ProposalCreated: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(EvexGovernanceContract, mockGovernanceContract);
    listener = container.resolve(ProposalCreatedListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockGovernanceContract.instance.filters.ProposalCreated).toHaveBeenCalled();
    expect(mockGovernanceContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockGovernanceContract.instance.removeAllListeners).toHaveBeenCalledWith('ProposalCreated');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: [
          BigInt(123),
          '0x1234567890123456789012345678901234567890',
          ['0x1111111111111111111111111111111111111111'],
          [BigInt(0)],
          ['transfer(address,uint256)'],
          ['0x'],
          BigInt(1000000),
          BigInt(2000000),
          'Test proposal description'
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
        proposalId: 123n,
        proposer: '0x1234567890123456789012345678901234567890',
        targets: ['0x1111111111111111111111111111111111111111'],
        values: [0n],
        signatures: ['transfer(address,uint256)'],
        calldatas: ['0x'],
        voteStart: 1000000n,
        voteEnd: 2000000n,
        description: 'Test proposal description',
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
      BigInt(123),
      '0x1234567890123456789012345678901234567890',
      ['0x1111111111111111111111111111111111111111'],
      [BigInt(0)],
      ['transfer(address,uint256)'],
      ['0x'],
      BigInt(1000000),
      BigInt(2000000),
      'Test proposal description',
      mockEvent
    );

    expect(consoleSpy).toHaveBeenCalledWith('Error in ProposalCreated event callback:', expect.any(Error));
    
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
      BigInt(123),
      '0x1234567890123456789012345678901234567890',
      ['0x1111111111111111111111111111111111111111'],
      [BigInt(0)],
      ['transfer(address,uint256)'],
      ['0x'],
      BigInt(1000000),
      BigInt(2000000),
      'Test proposal description',
      mockEvent
    );

    expect(callback1).toHaveBeenCalledWith({
      proposalId: 123n,
      proposer: '0x1234567890123456789012345678901234567890',
      targets: ['0x1111111111111111111111111111111111111111'],
      values: [0n],
      signatures: ['transfer(address,uint256)'],
      calldatas: ['0x'],
      voteStart: 1000000n,
      voteEnd: 2000000n,
      description: 'Test proposal description',
      blockNumber: 12345,
      transactionHash: '0xabc',
      logIndex: 0
    });
    expect(callback2).toHaveBeenCalledWith({
      proposalId: 123n,
      proposer: '0x1234567890123456789012345678901234567890',
      targets: ['0x1111111111111111111111111111111111111111'],
      values: [0n],
      signatures: ['transfer(address,uint256)'],
      calldatas: ['0x'],
      voteStart: 1000000n,
      voteEnd: 2000000n,
      description: 'Test proposal description',
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
      BigInt(456),
      '0x0987654321098765432109876543210987654321',
      ['0x2222222222222222222222222222222222222222'],
      [BigInt(1000000)],
      ['mint(address,uint256)'],
      ['0x'],
      BigInt(3000000),
      BigInt(4000000),
      'Another test proposal',
      {
        blockNumber: 12346,
        transactionHash: '0xdef',
        index: 1
      }
    );

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      proposalId: 456n,
      proposer: '0x0987654321098765432109876543210987654321',
      targets: ['0x2222222222222222222222222222222222222222'],
      values: [1000000n],
      signatures: ['mint(address,uint256)'],
      calldatas: ['0x'],
      voteStart: 3000000n,
      voteEnd: 4000000n,
      description: 'Another test proposal',
      blockNumber: 12346,
      transactionHash: '0xdef',
      logIndex: 1
    });
  });
}); 