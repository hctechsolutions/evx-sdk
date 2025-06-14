import { GetPositionFeeQuery } from '@queries/position-lens';
import { IGetPositionFeeParams } from '@interfaces/queries/params/IGetPositionFeeParams';
import { RPC } from '@providers';

jest.mock('@contracts', () => {
  const getPositionFeeMock = jest.fn();
  return {
    PositionLensContract: jest.fn().mockImplementation(() => ({
      instance: {
        getPositionFee: getPositionFeeMock,
      },
    })),
    __getPositionFeeMock: getPositionFeeMock,
  };
});

const { __getPositionFeeMock } = jest.requireMock('@contracts');

describe('GetPositionFeeQuery', () => {
  let query: GetPositionFeeQuery;
  let mockRpc: jest.Mocked<RPC>;

  beforeEach(() => {
    mockRpc = {
      provider: {} as any,
      setProvider: jest.fn(),
    } as any;
    query = new GetPositionFeeQuery(mockRpc);
    __getPositionFeeMock.mockReset();
  });

  it('should execute get position fee query successfully', async () => {
    const mockFees = [1000n, 2000n]; // owed0, owed1
    __getPositionFeeMock.mockResolvedValue(mockFees);

    const params: IGetPositionFeeParams = {
      tokenId: 1n,
    };

    const result = await query.execute(params);

    expect(__getPositionFeeMock).toHaveBeenCalledWith(params.tokenId);
    expect(result).toEqual({
      owed0: mockFees[0],
      owed1: mockFees[1],
    });
  });

  it('should handle errors during get position fee query execution', async () => {
    const error = new Error('Query failed');
    __getPositionFeeMock.mockRejectedValue(error);

    const params: IGetPositionFeeParams = {
      tokenId: 1n,
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 