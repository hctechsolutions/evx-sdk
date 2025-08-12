import { GetProposerQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IGetProposerQueryParams } from '@interfaces/queries/params/IGetProposerQueryParams';

describe('GetProposerQuery', () => {
  let query: GetProposerQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalProposer: jest.fn(),
      },
    } as any;

    query = new GetProposerQuery(governance);
  });

  it('should execute get proposer query successfully', async () => {
    const mockProposer = '0x1234567890abcdef1234567890abcdef12345678';
    (governance.instance.proposalProposer as unknown as jest.Mock).mockResolvedValue(mockProposer);

    const params: IGetProposerQueryParams = {
      proposalId: BigInt(123),
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalProposer).toHaveBeenCalledWith(
      params.proposalId
    );
    expect(result).toBe(mockProposer);
  });

  it('should handle errors during get proposer query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalProposer as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetProposerQueryParams = {
      proposalId: BigInt(123),
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle different proposal IDs', async () => {
    const mockProposer1 = '0x1234567890abcdef1234567890abcdef12345678';
    const mockProposer2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    
    (governance.instance.proposalProposer as unknown as jest.Mock)
      .mockResolvedValueOnce(mockProposer1)
      .mockResolvedValueOnce(mockProposer2);

    const params1: IGetProposerQueryParams = {
      proposalId: BigInt(123),
    };

    const params2: IGetProposerQueryParams = {
      proposalId: BigInt(456),
    };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.proposalProposer).toHaveBeenCalledWith(BigInt(123));
    expect(governance.instance.proposalProposer).toHaveBeenCalledWith(BigInt(456));
    expect(result1).toBe(mockProposer1);
    expect(result2).toBe(mockProposer2);
  });
}); 