import { ExtendedBallotTypeHashQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IExtendedBallotTypeHashQueryParams } from '@interfaces/queries/params/IExtendedBallotTypeHashQueryParams';

describe('ExtendedBallotTypeHashQuery', () => {
  let query: ExtendedBallotTypeHashQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        EXTENDED_BALLOT_TYPEHASH: jest.fn()
      }
    } as any;

    query = new ExtendedBallotTypeHashQuery(governance);
  });

  it('should execute extended ballot type hash query successfully', async () => {
    const mockExtendedBallotTypeHash =
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    (governance.instance.EXTENDED_BALLOT_TYPEHASH as unknown as jest.Mock).mockResolvedValue(
      mockExtendedBallotTypeHash
    );

    const params: IExtendedBallotTypeHashQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.EXTENDED_BALLOT_TYPEHASH).toHaveBeenCalledWith();
    expect(result).toBe(mockExtendedBallotTypeHash);
  });

  it('should handle errors during extended ballot type hash query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.EXTENDED_BALLOT_TYPEHASH as unknown as jest.Mock).mockRejectedValue(error);

    const params: IExtendedBallotTypeHashQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
