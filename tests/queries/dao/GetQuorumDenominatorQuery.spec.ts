import { GetQuorumDenominatorQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { IGetQuorumDenominatorQueryParams } from '@interfaces/queries/params/IGetQuorumDenominatorQueryParams';

describe('GetQuorumDenominatorQuery', () => {
  let query: GetQuorumDenominatorQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        quorumDenominator: jest.fn(),
      },
    } as any;

    query = new GetQuorumDenominatorQuery(governance);
  });

  it('should execute quorum denominator query successfully', async () => {
    const mockDenominator = BigInt(100); // Example denominator value
    
    (governance.instance.quorumDenominator as unknown as jest.Mock).mockResolvedValue(mockDenominator);

    const params: IGetQuorumDenominatorQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.quorumDenominator).toHaveBeenCalledWith();
    expect(result).toBe(mockDenominator);
  });

  it('should handle errors during quorum denominator query execution', async () => {
    const error = new Error('Query failed');
    
    (governance.instance.quorumDenominator as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetQuorumDenominatorQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent denominator values', async () => {
    const mockDenominator = BigInt(100);
    
    (governance.instance.quorumDenominator as unknown as jest.Mock)
      .mockResolvedValue(mockDenominator);

    const params: IGetQuorumDenominatorQueryParams = {};

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.quorumDenominator).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockDenominator);
    expect(result2).toBe(mockDenominator);
  });
}); 