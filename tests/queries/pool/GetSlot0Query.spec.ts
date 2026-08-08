import { GetSlot0Query } from '@queries/pool/GetSlot0Query';
import { RPC } from '@providers';
import { PoolContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('GetSlot0Query', () => {
  let query: GetSlot0Query;
  let mockRPC: jest.Mocked<RPC>;

  beforeEach(() => {
    container.clearInstances();

    mockRPC = {
      provider: {} as any,
      getProvider: jest.fn(),
      getSigner: jest.fn()
    } as any;

    container.registerInstance(RPC, mockRPC);
    query = container.resolve(GetSlot0Query);
  });

  it('should execute get slot0 query successfully', async () => {
    const mockParams = {
      poolAddress: '0x1234567890123456789012345678901234567890'
    };

    const mockSlot0 = {
      sqrtPriceX96: 79228162514264337593543950336n, // sqrt(1.5) * 2^96
      tick: -887220,
      observationIndex: 1,
      observationCardinality: 10,
      observationCardinalityNext: 11,
      feeProtocol: 0,
      unlocked: true
    };

    // Mock the PoolContract constructor and instance
    const mockPoolInstance = {
      slot0: {
        staticCall: jest.fn().mockResolvedValue(mockSlot0)
      }
    };

    (PoolContract as jest.MockedClass<typeof PoolContract>).mockImplementation(
      () =>
        ({
          instance: mockPoolInstance
        }) as any
    );

    const result = await query.execute(mockParams);

    expect(PoolContract).toHaveBeenCalledWith(
      mockParams.poolAddress,
      mockRPC
    );
    expect(mockPoolInstance.slot0.staticCall).toHaveBeenCalledWith();

    expect(result).toEqual({
      sqrtPriceX96: mockSlot0.sqrtPriceX96,
      tick: Number(mockSlot0.tick),
      observationIndex: Number(mockSlot0.observationIndex),
      observationCardinality: Number(mockSlot0.observationCardinality),
      observationCardinalityNext: Number(mockSlot0.observationCardinalityNext),
      feeProtocol: Number(mockSlot0.feeProtocol),
      unlocked: mockSlot0.unlocked
    });
  });

  it('should throw error when slot0 fails', async () => {
    const mockParams = {
      poolAddress: '0x1234567890123456789012345678901234567890'
    };

    const error = new Error('Failed to get slot0');
    const mockPoolInstance = {
      slot0: {
        staticCall: jest.fn().mockRejectedValue(error)
      }
    };

    (PoolContract as jest.MockedClass<typeof PoolContract>).mockImplementation(
      () =>
        ({
          instance: mockPoolInstance
        }) as any
    );

    await expect(query.execute(mockParams)).rejects.toThrow('Failed to get slot0');
  });
});
