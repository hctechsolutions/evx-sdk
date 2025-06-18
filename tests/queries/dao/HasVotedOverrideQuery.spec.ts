import { HasVotedOverrideQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { IHasVotedOverrideQueryParams } from '@interfaces/queries/params/IHasVotedOverrideQueryParams';

describe('HasVotedOverrideQuery', () => {
  let query: HasVotedOverrideQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        hasVotedOverride: jest.fn(),
      },
    } as any;

    query = new HasVotedOverrideQuery(governance);
  });

  it('should execute has voted override query successfully when account has voted with override', async () => {
    const mockHasVotedOverride = true;
    (governance.instance.hasVotedOverride as unknown as jest.Mock).mockResolvedValue(mockHasVotedOverride);

    const params: IHasVotedOverrideQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890',
    };

    const result = await query.execute(params);

    expect(governance.instance.hasVotedOverride).toHaveBeenCalledWith(
      params.proposalId,
      params.account
    );
    expect(result).toBe(mockHasVotedOverride);
  });

  it('should execute has voted override query successfully when account has not voted with override', async () => {
    const mockHasVotedOverride = false;
    (governance.instance.hasVotedOverride as unknown as jest.Mock).mockResolvedValue(mockHasVotedOverride);

    const params: IHasVotedOverrideQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890',
    };

    const result = await query.execute(params);

    expect(governance.instance.hasVotedOverride).toHaveBeenCalledWith(
      params.proposalId,
      params.account
    );
    expect(result).toBe(mockHasVotedOverride);
  });

  it('should handle errors during has voted override query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.hasVotedOverride as unknown as jest.Mock).mockRejectedValue(error);

    const params: IHasVotedOverrideQueryParams = {
      proposalId: BigInt(123),
      account: '0x1234567890123456789012345678901234567890',
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 