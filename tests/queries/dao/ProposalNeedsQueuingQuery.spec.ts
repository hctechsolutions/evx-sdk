import { ProposalNeedsQueuingQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IProposalNeedsQueuingQueryParams } from '@interfaces/queries/params/IProposalNeedsQueuingQueryParams';

describe('ProposalNeedsQueuingQuery', () => {
  let query: ProposalNeedsQueuingQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalNeedsQueuing: jest.fn(),
      },
    } as any;

    query = new ProposalNeedsQueuingQuery(governance);
  });

  it('should execute proposal needs queuing query successfully', async () => {
    const mockNeedsQueuing = true;
    (governance.instance.proposalNeedsQueuing as unknown as jest.Mock).mockResolvedValue(mockNeedsQueuing);

    const params: IProposalNeedsQueuingQueryParams = {
      proposalId: BigInt(123),
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalNeedsQueuing).toHaveBeenCalledWith(
      params.proposalId
    );
    expect(result).toBe(mockNeedsQueuing);
  });

  it('should handle errors during proposal needs queuing query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalNeedsQueuing as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProposalNeedsQueuingQueryParams = {
      proposalId: BigInt(123),
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle different proposal IDs', async () => {
    const mockNeedsQueuing1 = true;
    const mockNeedsQueuing2 = false;
    
    (governance.instance.proposalNeedsQueuing as unknown as jest.Mock)
      .mockResolvedValueOnce(mockNeedsQueuing1)
      .mockResolvedValueOnce(mockNeedsQueuing2);

    const params1: IProposalNeedsQueuingQueryParams = {
      proposalId: BigInt(123),
    };

    const params2: IProposalNeedsQueuingQueryParams = {
      proposalId: BigInt(456),
    };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.proposalNeedsQueuing).toHaveBeenCalledWith(BigInt(123));
    expect(governance.instance.proposalNeedsQueuing).toHaveBeenCalledWith(BigInt(456));
    expect(result1).toBe(mockNeedsQueuing1);
    expect(result2).toBe(mockNeedsQueuing2);
  });
}); 