import { GetProposalVotesQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { IGetProposalVotesQueryParams } from '@interfaces/queries/params/IGetProposalVotesQueryParams';
import { IGetProposalVotesResult } from '@interfaces/queries/IGetProposalVotesResult';

describe('GetProposalVotesQuery', () => {
  let query: GetProposalVotesQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalVotes: jest.fn(),
      },
    } as any;

    query = new GetProposalVotesQuery(governance);
  });

  it('should execute get proposal votes query successfully (array result)', async () => {
    const mockVotes = [100n, 200n, 50n];
    (governance.instance.proposalVotes as unknown as jest.Mock).mockResolvedValue(mockVotes);

    const params: IGetProposalVotesQueryParams = {
      proposalId: BigInt(123),
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalVotes).toHaveBeenCalledWith(params.proposalId);
    expect(result).toEqual({
      againstVotes: 100n,
      forVotes: 200n,
      abstainVotes: 50n,
    });
  });

  it('should execute get proposal votes query successfully (object result)', async () => {
    const mockVotes = {
      againstVotes: 100n,
      forVotes: 200n,
      abstainVotes: 50n,
    };
    (governance.instance.proposalVotes as unknown as jest.Mock).mockResolvedValue(mockVotes);

    const params: IGetProposalVotesQueryParams = {
      proposalId: BigInt(123),
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalVotes).toHaveBeenCalledWith(params.proposalId);
    expect(result).toEqual(mockVotes);
  });

  it('should handle errors during get proposal votes query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalVotes as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetProposalVotesQueryParams = {
      proposalId: BigInt(123),
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 