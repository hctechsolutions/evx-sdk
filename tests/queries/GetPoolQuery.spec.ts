import { IGetPoolParams } from '@interfaces/queries/params/IGetPoolParams';
import { IGetPoolOutput } from '@interfaces/queries/outputs/IGetPoolOutput';
import { PoolContract } from '@contracts';
import { GetPoolQuery } from '@queries';

jest.mock('@contracts', () => ({
  PoolContract: jest.fn()
}));

describe('GetPoolQuery', () => {
  let query: GetPoolQuery;
  let mockPoolInstance: any;

  beforeEach(() => {
    jest.resetModules();

    mockPoolInstance = {
      token0: jest.fn(),
      token1: jest.fn(),
      fee: jest.fn(),
      tickSpacing: jest.fn(),
      maxLiquidityPerTick: jest.fn()
    };

    (PoolContract as jest.Mock).mockImplementation(() => ({
      instance: mockPoolInstance
    }));

    query = new GetPoolQuery();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch pool data and return it correctly', async () => {
    mockPoolInstance.token0.mockResolvedValue('0xToken0');
    mockPoolInstance.token1.mockResolvedValue('0xToken1');
    mockPoolInstance.fee.mockResolvedValue(3000);
    mockPoolInstance.tickSpacing.mockResolvedValue(60);
    mockPoolInstance.maxLiquidityPerTick.mockResolvedValue('79228162514264337593543950336');

    const params: IGetPoolParams = {
      address: '0xPOOL_ADDRESS'
    };

    const result: IGetPoolOutput = await query.execute(params);

    expect(PoolContract).toHaveBeenCalledWith('0xPOOL_ADDRESS');
    expect(mockPoolInstance.token0).toHaveBeenCalled();
    expect(mockPoolInstance.token1).toHaveBeenCalled();
    expect(mockPoolInstance.fee).toHaveBeenCalled();
    expect(mockPoolInstance.tickSpacing).toHaveBeenCalled();
    expect(mockPoolInstance.maxLiquidityPerTick).toHaveBeenCalled();

    expect(result).toEqual({
      token0: '0xToken0',
      token1: '0xToken1',
      feeTier: 3000,
      tickSpacing: 60,
      maxLiquidityPerTick: '79228162514264337593543950336'
    });
  });

  it('should throw if token0() call fails', async () => {
    mockPoolInstance.token0.mockRejectedValue(new Error('token0 failed'));
    mockPoolInstance.token1.mockResolvedValue('0xToken1');
    mockPoolInstance.fee.mockResolvedValue(3000);
    mockPoolInstance.tickSpacing.mockResolvedValue(60);
    mockPoolInstance.maxLiquidityPerTick.mockResolvedValue('79228162514264337593543950336');

    const params: IGetPoolParams = {
      address: '0xPOOL_ADDRESS'
    };

    await expect(query.execute(params)).rejects.toThrow('token0 failed');
  });

  it('should throw if fee() call fails', async () => {
    mockPoolInstance.token0.mockResolvedValue('0xToken0');
    mockPoolInstance.token1.mockResolvedValue('0xToken1');
    mockPoolInstance.fee.mockRejectedValue(new Error('fee failed'));
    mockPoolInstance.tickSpacing.mockResolvedValue(60);
    mockPoolInstance.maxLiquidityPerTick.mockResolvedValue('79228162514264337593543950336');

    const params: IGetPoolParams = {
      address: '0xPOOL_ADDRESS'
    };

    await expect(query.execute(params)).rejects.toThrow('fee failed');
  });
});
