import { BallotTypeHashQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IBallotTypeHashQueryParams } from '@interfaces/queries/params/IBallotTypeHashQueryParams';

describe('BallotTypeHashQuery', () => {
  let query: BallotTypeHashQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        BALLOT_TYPEHASH: jest.fn()
      }
    } as any;

    query = new BallotTypeHashQuery(governance);
  });

  it('should execute ballot type hash query successfully', async () => {
    const mockBallotTypeHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    (governance.instance.BALLOT_TYPEHASH as unknown as jest.Mock).mockResolvedValue(
      mockBallotTypeHash
    );

    const params: IBallotTypeHashQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.BALLOT_TYPEHASH).toHaveBeenCalledWith();
    expect(result).toBe(mockBallotTypeHash);
  });

  it('should handle errors during ballot type hash query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.BALLOT_TYPEHASH as unknown as jest.Mock).mockRejectedValue(error);

    const params: IBallotTypeHashQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
