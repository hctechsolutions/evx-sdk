import { IGetFeeAmountTickSpacingQueryParams } from '@interfaces/queries/params/IGetFeeAmountTickSpacingQueryParams';
import { GetFeeAmountTickSpacingQuery } from '@queries';
import { FactoryContract } from '@contracts';
import { ethers } from 'ethers';

jest.mock('@contracts', () => ({
  FactoryContract: jest.fn()
}));

describe('GetFeeAmountTickSpacingQuery', () => {
  let query: GetFeeAmountTickSpacingQuery;
  let mockFactory: Partial<FactoryContract>;

  beforeEach(() => {
    jest.resetModules();

    const mockFeeAmountTickSpacing = jest.fn().mockImplementation(() => Promise.resolve(60));
    mockFactory = {
      instance: {
        feeAmountTickSpacing: mockFeeAmountTickSpacing
      } as unknown as ethers.Contract
    };

    query = new GetFeeAmountTickSpacingQuery(mockFactory as FactoryContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tick spacing and return it correctly', async () => {
    const expectedTickSpacing = 60;
    const mockFeeAmountTickSpacing = mockFactory.instance!.feeAmountTickSpacing as unknown as jest.Mock;
    mockFeeAmountTickSpacing.mockResolvedValue(expectedTickSpacing);

    const params: IGetFeeAmountTickSpacingQueryParams = {
      fee: 3000
    };

    const result = await query.execute(params);

    expect(mockFeeAmountTickSpacing).toHaveBeenCalledWith(params.fee);
    expect(result).toBe(expectedTickSpacing);
  });

  it('should throw if feeAmountTickSpacing call fails', async () => {
    const mockFeeAmountTickSpacing = mockFactory.instance!.feeAmountTickSpacing as unknown as jest.Mock;
    mockFeeAmountTickSpacing.mockRejectedValue(new Error('Failed to get tick spacing'));

    const params: IGetFeeAmountTickSpacingQueryParams = {
      fee: 3000
    };

    await expect(query.execute(params)).rejects.toThrow('Failed to get tick spacing');
  });
}); 