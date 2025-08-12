import { ProposalDeadlineQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IProposalDeadlineQueryParams } from '@interfaces/queries/params/IProposalDeadlineQueryParams';

describe('ProposalDeadlineQuery', () => {
  let query: ProposalDeadlineQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalDeadline: jest.fn()
      }
    } as any;

    query = new ProposalDeadlineQuery(governance);
  });

  it('should execute proposal deadline query successfully', async () => {
    const mockDeadline = BigInt(1735689600); // Example timestamp
    (governance.instance.proposalDeadline as unknown as jest.Mock).mockResolvedValue(mockDeadline);

    const params: IProposalDeadlineQueryParams = {
      proposalId: BigInt(123)
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalDeadline).toHaveBeenCalledWith(params.proposalId);
    expect(result).toBe(mockDeadline);
  });

  it('should handle errors during proposal deadline query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalDeadline as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProposalDeadlineQueryParams = {
      proposalId: BigInt(123)
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle different proposal IDs', async () => {
    const mockDeadline1 = BigInt(1735689600);
    const mockDeadline2 = BigInt(1735776000);

    (governance.instance.proposalDeadline as unknown as jest.Mock)
      .mockResolvedValueOnce(mockDeadline1)
      .mockResolvedValueOnce(mockDeadline2);

    const params1: IProposalDeadlineQueryParams = {
      proposalId: BigInt(123)
    };

    const params2: IProposalDeadlineQueryParams = {
      proposalId: BigInt(456)
    };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.proposalDeadline).toHaveBeenCalledWith(BigInt(123));
    expect(governance.instance.proposalDeadline).toHaveBeenCalledWith(BigInt(456));
    expect(result1).toBe(mockDeadline1);
    expect(result2).toBe(mockDeadline2);
  });
});
