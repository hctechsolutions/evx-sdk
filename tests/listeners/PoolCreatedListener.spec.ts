import { PoolCreatedListener } from '@listeners';
import { FactoryContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');

describe('PoolCreatedListener', () => {
  let listener: PoolCreatedListener;
  let mockFactoryContract: jest.Mocked<FactoryContract>;

  beforeEach(() => {
    container.clearInstances();
    
    const mockFilter = { filter: 'mock' };
    mockFactoryContract = {
      instance: {
        filters: {
          PoolCreated: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(FactoryContract, mockFactoryContract);
    listener = container.resolve(PoolCreatedListener);
  });

  it('should start listening for events', async () => {
    const callback = jest.fn();

    await listener.start(callback);

    expect(mockFactoryContract.instance.filters.PoolCreated).toHaveBeenCalled();
    expect(mockFactoryContract.instance.on).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    expect(listener.listening).toBe(true);
  });

  it('should stop listening for events', async () => {
    const callback = jest.fn();
    await listener.start(callback); // Start listening first
    
    listener.stop();

    expect(mockFactoryContract.instance.removeAllListeners).toHaveBeenCalledWith('PoolCreated');
    expect(listener.listening).toBe(false);
  });

  it('should get historical events', async () => {
    const mockEvents = [
      {
        args: ['0x123', '0x456', BigInt(3000), BigInt(60), '0x789'],
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
        token0: '0x123',
        token1: '0x456',
        fee: 3000n,
        tickSpacing: 60n,
        pool: '0x789',
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

    await capturedHandler('0x123', '0x456', BigInt(3000), BigInt(60), '0x789', mockEvent);

    expect(consoleSpy).toHaveBeenCalledWith('Error in PoolCreated event callback:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
}); 