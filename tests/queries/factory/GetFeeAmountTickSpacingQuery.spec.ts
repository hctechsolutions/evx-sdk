import { GetFeeAmountTickSpacingQuery } from '@queries/factory';
import { FactoryContract } from '@contracts';
import { IGetFeeAmountTickSpacingQueryParams } from '@interfaces/queries/params/IGetFeeAmountTickSpacingQueryParams';

describe('GetFeeAmountTickSpacingQuery', () => {
  let query: GetFeeAmountTickSpacingQuery;
  let factory: jest.Mocked<FactoryContract>;

  beforeEach(() => {
    factory = {
      instance: {
        feeAmountTickSpacing: jest.fn(),
      },
    } as any;

    query = new GetFeeAmountTickSpacingQuery(factory);
  });

  it('should execute get fee amount tick spacing query successfully', async () => {
    const mockTickSpacing = 60;
    (factory.instance.feeAmountTickSpacing as unknown as jest.Mock).mockResolvedValue(mockTickSpacing);

    const params: IGetFeeAmountTickSpacingQueryParams = {
      fee: 3000,
    };

    const result = await query.execute(params);

    expect(factory.instance.feeAmountTickSpacing).toHaveBeenCalledWith(params.fee);
    expect(result).toBe(mockTickSpacing);
  });

  it('should handle errors during get fee amount tick spacing query execution', async () => {
    const error = new Error('Query failed');
    (factory.instance.feeAmountTickSpacing as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetFeeAmountTickSpacingQueryParams = {
      fee: 3000,
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 