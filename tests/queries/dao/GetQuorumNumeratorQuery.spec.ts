import { GetQuorumNumeratorQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { IGetQuorumNumeratorQueryParams } from '@interfaces/queries/params/IGetQuorumNumeratorQueryParams';

describe('GetQuorumNumeratorQuery', () => {
  let query: GetQuorumNumeratorQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        quorumNumerator: jest.fn(),
      },
    } as any;

    query = new GetQuorumNumeratorQuery(governance);
  });

  it('should execute quorum numerator query without timepoint successfully', async () => {
    const mockNumerator = BigInt(50); // Example numerator value
    
    (governance.instance.quorumNumerator as unknown as jest.Mock).mockResolvedValue(mockNumerator);

    const params: IGetQuorumNumeratorQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.quorumNumerator).toHaveBeenCalledWith();
    expect(result).toBe(mockNumerator);
  });

  it('should execute quorum numerator query with timepoint successfully', async () => {
    const mockNumerator = BigInt(60); // Example numerator value
    const timepoint = BigInt(12345678);
    
    (governance.instance.quorumNumerator as unknown as jest.Mock).mockResolvedValue(mockNumerator);

    const params: IGetQuorumNumeratorQueryParams = {
      timepoint,
    };

    const result = await query.execute(params);

    expect(governance.instance.quorumNumerator).toHaveBeenCalledWith(timepoint);
    expect(result).toBe(mockNumerator);
  });

  it('should handle errors during quorum numerator query execution without timepoint', async () => {
    const error = new Error('Query failed');
    
    (governance.instance.quorumNumerator as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetQuorumNumeratorQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle errors during quorum numerator query execution with timepoint', async () => {
    const error = new Error('Query failed');
    const timepoint = BigInt(12345678);
    
    (governance.instance.quorumNumerator as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetQuorumNumeratorQueryParams = {
      timepoint,
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent numerator values for same parameters', async () => {
    const mockNumerator = BigInt(50);
    
    (governance.instance.quorumNumerator as unknown as jest.Mock)
      .mockResolvedValue(mockNumerator);

    const params: IGetQuorumNumeratorQueryParams = {};

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.quorumNumerator).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockNumerator);
    expect(result2).toBe(mockNumerator);
  });

  it('should handle different timepoints correctly', async () => {
    const mockNumerator1 = BigInt(50);
    const mockNumerator2 = BigInt(60);
    const timepoint1 = BigInt(12345678);
    const timepoint2 = BigInt(87654321);
    
    (governance.instance.quorumNumerator as unknown as jest.Mock)
      .mockResolvedValueOnce(mockNumerator1)
      .mockResolvedValueOnce(mockNumerator2);

    const params1: IGetQuorumNumeratorQueryParams = { timepoint: timepoint1 };
    const params2: IGetQuorumNumeratorQueryParams = { timepoint: timepoint2 };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.quorumNumerator).toHaveBeenCalledWith(timepoint1);
    expect(governance.instance.quorumNumerator).toHaveBeenCalledWith(timepoint2);
    expect(result1).toBe(mockNumerator1);
    expect(result2).toBe(mockNumerator2);
  });
}); 