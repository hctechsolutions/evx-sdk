import { GetPositionQuery } from '@queries/position-manager';
import { PositionManagerContract } from '@contracts';
import { IGetPositionParams } from '@interfaces/queries/params/IGetPositionParams';
import { IGetPositionOutput } from '@interfaces/queries/outputs/IGetPositionOutput';
import { RPC } from '@providers';

jest.mock('@contracts', () => {
  const positionsMock = jest.fn();
  return {
    PositionManagerContract: jest.fn().mockImplementation(() => ({
      instance: {
        positions: positionsMock,
      },
    })),
    __positionsMock: positionsMock,
  };
});

const { __positionsMock } = jest.requireMock('@contracts');

describe('GetPositionQuery', () => {
  let query: GetPositionQuery;
  let mockRpc: jest.Mocked<RPC>;

  beforeEach(() => {
    mockRpc = {
      provider: {} as any,
      setProvider: jest.fn(),
    } as any;
    query = new GetPositionQuery(mockRpc);
    __positionsMock.mockReset();
  });

  it('should execute get position query successfully', async () => {
    const mockPosition = [
      1n, // nonce
      '0xOperator', // operator
      '0xToken0', // token0
      '0xToken1', // token1
      3000, // fee
      -887220, // tickLower
      887220, // tickUpper
      1000000n, // liquidity
      0n, // feeGrowthInside0LastX128
      0n, // feeGrowthInside1LastX128
      0n, // tokensOwed0
      0n, // tokensOwed1
    ];
    __positionsMock.mockResolvedValue(mockPosition);

    const params: IGetPositionParams = {
      tokenId: 1n,
    };

    const result = await query.execute(params);

    expect(__positionsMock).toHaveBeenCalledWith(params.tokenId);
    expect(result).toEqual({
      nonce: mockPosition[0],
      operator: mockPosition[1],
      token0: mockPosition[2],
      token1: mockPosition[3],
      fee: mockPosition[4],
      tickLower: mockPosition[5],
      tickUpper: mockPosition[6],
      liquidity: mockPosition[7],
      feeGrowthInside0LastX128: mockPosition[8],
      feeGrowthInside1LastX128: mockPosition[9],
      tokensOwed0: mockPosition[10],
      tokensOwed1: mockPosition[11],
    });
  });

  it('should handle errors during get position query execution', async () => {
    const error = new Error('Query failed');
    __positionsMock.mockRejectedValue(error);

    const params: IGetPositionParams = {
      tokenId: 1n,
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 