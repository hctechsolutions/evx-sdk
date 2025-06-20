import { GetVotingPeriodQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { IGetVotingPeriodQueryParams } from '@interfaces/queries/params/IGetVotingPeriodQueryParams';

describe('GetVotingPeriodQuery', () => {
  let query: GetVotingPeriodQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        votingPeriod: jest.fn(),
      },
    } as any;

    query = new GetVotingPeriodQuery(governance);
  });

  it('should execute voting period query successfully', async () => {
    const mockPeriod = BigInt(604800); // Example period value (7 days in seconds)
    
    (governance.instance.votingPeriod as unknown as jest.Mock).mockResolvedValue(mockPeriod);

    const params: IGetVotingPeriodQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.votingPeriod).toHaveBeenCalledWith();
    expect(result).toBe(mockPeriod);
  });

  it('should handle errors during voting period query execution', async () => {
    const error = new Error('Query failed');
    
    (governance.instance.votingPeriod as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetVotingPeriodQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent period values', async () => {
    const mockPeriod = BigInt(604800);
    
    (governance.instance.votingPeriod as unknown as jest.Mock)
      .mockResolvedValue(mockPeriod);

    const params: IGetVotingPeriodQueryParams = {};

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.votingPeriod).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockPeriod);
    expect(result2).toBe(mockPeriod);
  });
}); 