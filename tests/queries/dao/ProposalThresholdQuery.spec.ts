import { ProposalThresholdQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IProposalThresholdQueryParams } from '@interfaces/queries/params/IProposalThresholdQueryParams';

describe('ProposalThresholdQuery', () => {
  let query: ProposalThresholdQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalThreshold: jest.fn(),
      },
    } as any;

    query = new ProposalThresholdQuery(governance);
  });

  it('should execute proposal threshold query successfully', async () => {
    const mockThreshold = BigInt(1000000); // Example threshold value
    (governance.instance.proposalThreshold as unknown as jest.Mock).mockResolvedValue(mockThreshold);

    const params: IProposalThresholdQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.proposalThreshold).toHaveBeenCalledWith();
    expect(result).toBe(mockThreshold);
  });

  it('should handle errors during proposal threshold query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalThreshold as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProposalThresholdQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent threshold values', async () => {
    const mockThreshold = BigInt(1000000);
    
    (governance.instance.proposalThreshold as unknown as jest.Mock)
      .mockResolvedValue(mockThreshold);

    const params: IProposalThresholdQueryParams = {};

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.proposalThreshold).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockThreshold);
    expect(result2).toBe(mockThreshold);
  });
}); 