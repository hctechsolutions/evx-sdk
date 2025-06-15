import { GetPopulatedTicksQuery } from '@queries/tick-lens/GetPopulatedTicksQuery';
import { RPC } from '@providers';
import { TickLensContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('GetPopulatedTicksQuery', () => {
  let query: GetPopulatedTicksQuery;
  let mockRPC: jest.Mocked<RPC>;
  let mockTickLensContract: jest.Mocked<TickLensContract>;

  beforeEach(() => {
    container.clearInstances();
    
    mockRPC = {
      provider: {} as any,
      getProvider: jest.fn(),
      getSigner: jest.fn()
    } as any;

    const staticCallMock = jest.fn();
    mockTickLensContract = {
      instance: {
        getPopulatedTicksInWord: {
          staticCall: staticCallMock
        }
      }
    } as any;

    container.registerInstance(RPC, mockRPC);
    container.registerInstance(TickLensContract, mockTickLensContract);
    query = container.resolve(GetPopulatedTicksQuery);
  });

  it('should throw error when tickBitmapIndex is below minimum', async () => {
    const mockParams = {
      pool: '0x123',
      tickBitmapIndex: -32769
    };

    await expect(query.execute(mockParams)).rejects.toThrow('tickBitmapIndex must be between -32768 and 32767');
  });

  it('should throw error when tickBitmapIndex is above maximum', async () => {
    const mockParams = {
      pool: '0x123',
      tickBitmapIndex: 32768
    };

    await expect(query.execute(mockParams)).rejects.toThrow('tickBitmapIndex must be between -32768 and 32767');
  });

  it('should execute get populated ticks query successfully', async () => {
    const mockParams = {
      pool: '0x123',
      tickBitmapIndex: 0
    };

    const mockResult = [
      {
        tick: -887220,
        liquidityNet: BigInt(1000000),
        liquidityGross: BigInt(2000000)
      },
      {
        tick: -887200,
        liquidityNet: BigInt(-500000),
        liquidityGross: BigInt(1500000)
      }
    ];

    (mockTickLensContract.instance.getPopulatedTicksInWord.staticCall as jest.Mock).mockResolvedValue(mockResult);

    const result = await query.execute(mockParams);

    expect(mockTickLensContract.instance.getPopulatedTicksInWord.staticCall).toHaveBeenCalledWith(
      mockParams.pool,
      mockParams.tickBitmapIndex
    );

    expect(result).toEqual({
      populatedTicks: mockResult.map(tick => ({
        tick: Number(tick.tick),
        liquidityNet: tick.liquidityNet,
        liquidityGross: tick.liquidityGross
      }))
    });
  });

  it('should throw error when get populated ticks fails', async () => {
    const mockParams = {
      pool: '0x123',
      tickBitmapIndex: 0
    };

    const error = new Error('Failed to get populated ticks');
    (mockTickLensContract.instance.getPopulatedTicksInWord.staticCall as jest.Mock).mockRejectedValue(error);

    await expect(query.execute(mockParams)).rejects.toThrow('Failed to get populated ticks');
  });
}); 