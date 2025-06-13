import { IGetOwnerQueryParams } from '@interfaces/queries/params/IGetOwnerQueryParams';
import { GetOwnerQuery } from '@queries';
import { FactoryContract } from '@contracts';
import { ethers } from 'ethers';

jest.mock('@contracts', () => ({
  FactoryContract: jest.fn()
}));

describe('GetOwnerQuery', () => {
  let query: GetOwnerQuery;
  let mockFactory: Partial<FactoryContract>;

  beforeEach(() => {
    jest.resetModules();

    const mockOwner = jest.fn().mockImplementation(() => Promise.resolve('0x1234567890123456789012345678901234567890'));
    mockFactory = {
      instance: {
        owner: mockOwner
      } as unknown as ethers.Contract
    };

    query = new GetOwnerQuery(mockFactory as FactoryContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch owner and return it correctly', async () => {
    const expectedOwner = '0x1234567890123456789012345678901234567890';
    const mockOwner = mockFactory.instance!.owner as unknown as jest.Mock;
    mockOwner.mockResolvedValue(expectedOwner);

    const params: IGetOwnerQueryParams = {};

    const result = await query.execute();

    expect(mockOwner).toHaveBeenCalled();
    expect(result).toBe(expectedOwner);
  });

  it('should throw if owner call fails', async () => {
    const mockOwner = mockFactory.instance!.owner as unknown as jest.Mock;
    mockOwner.mockRejectedValue(new Error('Failed to get owner'));

    const params: IGetOwnerQueryParams = {};

    await expect(query.execute()).rejects.toThrow('Failed to get owner');
  });
}); 