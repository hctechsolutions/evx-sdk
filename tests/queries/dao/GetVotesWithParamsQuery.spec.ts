import { GetVotesWithParamsQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IGetVotesWithParamsQueryParams } from '@interfaces/queries/params/IGetVotesWithParamsQueryParams';

describe('GetVotesWithParamsQuery', () => {
  let query: GetVotesWithParamsQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        getVotesWithParams: jest.fn(),
      },
    } as any;

    query = new GetVotesWithParamsQuery(governance);
  });

  it('should execute get votes with params query successfully', async () => {
    const mockVotes = BigInt(1500000);
    (governance.instance.getVotesWithParams as unknown as jest.Mock).mockResolvedValue(mockVotes);

    const params: IGetVotesWithParamsQueryParams = {
      account: '0x1234567890123456789012345678901234567890',
      timepoint: BigInt(12345678),
      params: '0x1234567890abcdef',
    };

    const result = await query.execute(params);

    expect(governance.instance.getVotesWithParams).toHaveBeenCalledWith(
      params.account,
      params.timepoint,
      params.params
    );
    expect(result).toBe(mockVotes);
  });

  it('should handle errors during get votes with params query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.getVotesWithParams as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetVotesWithParamsQueryParams = {
      account: '0x1234567890123456789012345678901234567890',
      timepoint: BigInt(12345678),
      params: '0x1234567890abcdef',
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 