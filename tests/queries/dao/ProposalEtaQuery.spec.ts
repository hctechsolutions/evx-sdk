import { ProposalEtaQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IProposalEtaQueryParams } from '@interfaces/queries/params/IProposalEtaQueryParams';

describe('ProposalEtaQuery', () => {
  let query: ProposalEtaQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalEta: jest.fn()
      }
    } as any;

    query = new ProposalEtaQuery(governance);
  });

  it('should execute proposal eta query successfully', async () => {
    const mockEta = BigInt(1735689600); // Example timestamp
    (governance.instance.proposalEta as unknown as jest.Mock).mockResolvedValue(mockEta);

    const params: IProposalEtaQueryParams = {
      proposalId: BigInt(123)
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalEta).toHaveBeenCalledWith(params.proposalId);
    expect(result).toBe(mockEta);
  });

  it('should handle errors during proposal eta query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalEta as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProposalEtaQueryParams = {
      proposalId: BigInt(123)
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle different proposal IDs', async () => {
    const mockEta1 = BigInt(1735689600);
    const mockEta2 = BigInt(1735776000);

    (governance.instance.proposalEta as unknown as jest.Mock)
      .mockResolvedValueOnce(mockEta1)
      .mockResolvedValueOnce(mockEta2);

    const params1: IProposalEtaQueryParams = {
      proposalId: BigInt(123)
    };

    const params2: IProposalEtaQueryParams = {
      proposalId: BigInt(456)
    };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.proposalEta).toHaveBeenCalledWith(BigInt(123));
    expect(governance.instance.proposalEta).toHaveBeenCalledWith(BigInt(456));
    expect(result1).toBe(mockEta1);
    expect(result2).toBe(mockEta2);
  });
});
