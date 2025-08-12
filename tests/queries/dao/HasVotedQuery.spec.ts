import { HasVotedQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IHasVotedQueryParams } from '@interfaces/queries/params/IHasVotedQueryParams';

describe('HasVotedQuery', () => {
  let query: HasVotedQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        hasVoted: jest.fn()
      }
    } as any;

    query = new HasVotedQuery(governance);
  });

  it('should execute has voted query successfully when account has voted', async () => {
    const mockHasVoted = true;
    (governance.instance.hasVoted as unknown as jest.Mock).mockResolvedValue(mockHasVoted);

    const params: IHasVotedQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890'
    };

    const result = await query.execute(params);

    expect(governance.instance.hasVoted).toHaveBeenCalledWith(params.proposalId, params.account);
    expect(result).toBe(mockHasVoted);
  });

  it('should execute has voted query successfully when account has not voted', async () => {
    const mockHasVoted = false;
    (governance.instance.hasVoted as unknown as jest.Mock).mockResolvedValue(mockHasVoted);

    const params: IHasVotedQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890'
    };

    const result = await query.execute(params);

    expect(governance.instance.hasVoted).toHaveBeenCalledWith(params.proposalId, params.account);
    expect(result).toBe(mockHasVoted);
  });

  it('should handle errors during has voted query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.hasVoted as unknown as jest.Mock).mockRejectedValue(error);

    const params: IHasVotedQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890'
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
