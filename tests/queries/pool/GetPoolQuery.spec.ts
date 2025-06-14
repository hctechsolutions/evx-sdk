import { GetPoolQuery } from '@queries/pool';
import { PoolContract } from '@contracts';
import { IGetPoolParams } from '@interfaces/queries/params/IGetPoolParams';

jest.mock('@contracts', () => ({
  PoolContract: jest.fn().mockImplementation(() => ({
    instance: {
      token0: jest.fn(),
      token1: jest.fn(),
      fee: jest.fn(),
      tickSpacing: jest.fn(),
      maxLiquidityPerTick: jest.fn(),
    }
  })),
}));

describe('GetPoolQuery', () => {
  let query: GetPoolQuery;
  let mockPool: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = new PoolContract('0xPOOL');
    query = new GetPoolQuery();
  });

  it('should execute get pool query successfully', async () => {
    (mockPool.instance.token0 as jest.Mock).mockResolvedValue('0xToken0');
    (mockPool.instance.token1 as jest.Mock).mockResolvedValue('0xToken1');
    (mockPool.instance.fee as jest.Mock).mockResolvedValue(3000n);
    (mockPool.instance.tickSpacing as jest.Mock).mockResolvedValue(60n);
    (mockPool.instance.maxLiquidityPerTick as jest.Mock).mockResolvedValue(100000n);

    const params: IGetPoolParams = {
      address: '0xPOOL',
    };

    (PoolContract as jest.Mock).mockImplementation(() => mockPool);

    const result = await query.execute(params);

    expect(mockPool.instance.token0).toHaveBeenCalled();
    expect(mockPool.instance.token1).toHaveBeenCalled();
    expect(mockPool.instance.fee).toHaveBeenCalled();
    expect(mockPool.instance.tickSpacing).toHaveBeenCalled();
    expect(mockPool.instance.maxLiquidityPerTick).toHaveBeenCalled();
    expect(result).toEqual({
      token0: '0xToken0',
      token1: '0xToken1',
      feeTier: 3000n,
      tickSpacing: 60n,
      maxLiquidityPerTick: 100000n,
    });
  });

  it('should handle errors during get pool query execution', async () => {
    (mockPool.instance.token0 as jest.Mock).mockImplementation(() => { throw new Error('Query failed'); });

    const params: IGetPoolParams = {
      address: '0xPOOL',
    };

    (PoolContract as jest.Mock).mockImplementation(() => mockPool);

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
