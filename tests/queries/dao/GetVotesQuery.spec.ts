import { GetVotesQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IGetVotesQueryParams } from '@interfaces/queries/params/IGetVotesQueryParams';

describe('GetVotesQuery', () => {
  let query: GetVotesQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        getVotes: jest.fn(),
      },
    } as any;

    query = new GetVotesQuery(governance);
  });

  it('should execute get votes query successfully', async () => {
    const mockVotes = BigInt(1000000);
    (governance.instance.getVotes as unknown as jest.Mock).mockResolvedValue(mockVotes);

    const params: IGetVotesQueryParams = {
      account: '0x1234567890123456789012345678901234567890',
      blockNumber: BigInt(12345678),
    };

    const result = await query.execute(params);

    expect(governance.instance.getVotes).toHaveBeenCalledWith(
      params.account,
      params.blockNumber
    );
    expect(result).toBe(mockVotes);
  });

  it('should handle errors during get votes query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.getVotes as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetVotesQueryParams = {
      account: '0x1234567890123456789012345678901234567890',
      blockNumber: BigInt(12345678),
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 