import { IGetOwnerQueryParams } from '@interfaces/queries/params/IGetOwnerQueryParams';
import { GetOwnerQuery } from '@queries/position-manager';
import { PositionManagerContract } from '@contracts';
import { ethers } from 'ethers';

jest.mock('@contracts', () => ({
  FactoryContract: jest.fn()
}));

describe('GetOwnerQuery', () => {
  let query: GetOwnerQuery;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        owner: jest.fn(),
      },
    } as any;

    query = new GetOwnerQuery(positionManager);
  });

  it('should execute get owner query successfully', async () => {
    const mockOwner = '0x123';
    (positionManager.instance.owner as unknown as jest.Mock).mockResolvedValue(mockOwner);

    const result = await query.execute();

    expect(positionManager.instance.owner).toHaveBeenCalled();
    expect(result).toBe(mockOwner);
  });

  it('should handle errors during get owner query execution', async () => {
    const error = new Error('Query failed');
    (positionManager.instance.owner as unknown as jest.Mock).mockRejectedValue(error);

    await expect(query.execute()).rejects.toThrow('Query failed');
  });
}); 