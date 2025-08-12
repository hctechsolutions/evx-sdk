import { GetVotingDelayQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IGetVotingDelayQueryParams } from '@interfaces/queries/params/IGetVotingDelayQueryParams';

describe('GetVotingDelayQuery', () => {
  let query: GetVotingDelayQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        votingDelay: jest.fn()
      }
    } as any;

    query = new GetVotingDelayQuery(governance);
  });

  it('should execute voting delay query successfully', async () => {
    const mockDelay = BigInt(7200); // Example delay value (2 hours in seconds)

    (governance.instance.votingDelay as unknown as jest.Mock).mockResolvedValue(mockDelay);

    const params: IGetVotingDelayQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.votingDelay).toHaveBeenCalledWith();
    expect(result).toBe(mockDelay);
  });

  it('should handle errors during voting delay query execution', async () => {
    const error = new Error('Query failed');

    (governance.instance.votingDelay as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetVotingDelayQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent delay values', async () => {
    const mockDelay = BigInt(7200);

    (governance.instance.votingDelay as unknown as jest.Mock).mockResolvedValue(mockDelay);

    const params: IGetVotingDelayQueryParams = {};

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.votingDelay).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockDelay);
    expect(result2).toBe(mockDelay);
  });
});
