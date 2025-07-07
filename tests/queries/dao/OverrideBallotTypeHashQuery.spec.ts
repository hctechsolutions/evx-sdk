import { OverrideBallotTypeHashQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IOverrideBallotTypeHashQueryParams } from '@interfaces/queries/params/IOverrideBallotTypeHashQueryParams';

describe('OverrideBallotTypeHashQuery', () => {
  let query: OverrideBallotTypeHashQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        OVERRIDE_BALLOT_TYPEHASH: jest.fn(),
      },
    } as any;

    query = new OverrideBallotTypeHashQuery(governance);
  });

  it('should execute override ballot type hash query successfully', async () => {
    const mockOverrideBallotTypeHash = '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456';
    (governance.instance.OVERRIDE_BALLOT_TYPEHASH as unknown as jest.Mock).mockResolvedValue(mockOverrideBallotTypeHash);

    const params: IOverrideBallotTypeHashQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.OVERRIDE_BALLOT_TYPEHASH).toHaveBeenCalledWith();
    expect(result).toBe(mockOverrideBallotTypeHash);
  });

  it('should handle errors during override ballot type hash query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.OVERRIDE_BALLOT_TYPEHASH as unknown as jest.Mock).mockRejectedValue(error);

    const params: IOverrideBallotTypeHashQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 