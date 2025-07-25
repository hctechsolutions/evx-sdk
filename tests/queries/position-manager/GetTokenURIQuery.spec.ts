import { GetTokenURIQuery } from '@queries/position-manager';
import { IGetTokenURIQueryParams } from '@interfaces/queries/params/IGetTokenURIQueryParams';

jest.mock('@contracts', () => {
  const tokenURIMock = jest.fn();
  return {
    PositionManagerContract: jest.fn().mockImplementation(() => ({
      instance: {
        tokenURI: tokenURIMock
      }
    })),
    __tokenURIMock: tokenURIMock
  };
});

const { __tokenURIMock } = jest.requireMock('@contracts');

describe('GetTokenURIQuery', () => {
  let query: GetTokenURIQuery;
  let mockPositionManager: any;

  beforeEach(() => {
    mockPositionManager = {
      instance: {
        tokenURI: __tokenURIMock
      }
    };
    query = new GetTokenURIQuery(mockPositionManager);
    __tokenURIMock.mockReset();
  });

  it('should execute get token URI query successfully and decode JSON', async () => {
    const json = { name: 'NFT', description: 'desc', image: 'img.png' };
    const base64 = Buffer.from(JSON.stringify(json), 'utf-8').toString('base64');
    const mockTokenURI = `data:application/json;base64,${base64}`;
    __tokenURIMock.mockResolvedValue(mockTokenURI);

    const params: IGetTokenURIQueryParams = { tokenId: 1n };

    const result = await query.execute(params);

    expect(__tokenURIMock).toHaveBeenCalledWith(1n);
    expect(result).toEqual(json);
  });

  it('should throw if tokenURI format is invalid', async () => {
    __tokenURIMock.mockResolvedValue('not-a-base64-uri');
    const params: IGetTokenURIQueryParams = { tokenId: 1n };
    await expect(query.execute(params)).rejects.toThrow('Invalid tokenURI format');
  });

  it('should handle errors during get token URI query execution', async () => {
    const error = new Error('Query failed');
    __tokenURIMock.mockRejectedValue(error);
    const params: IGetTokenURIQueryParams = { tokenId: 1n };
    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
