import { TokenQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { ITokenQueryParams } from '@interfaces/queries/params/ITokenQueryParams';

describe('TokenQuery', () => {
  let query: TokenQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        token: jest.fn(),
      },
    } as any;

    query = new TokenQuery(governance);
  });

  it('should execute token query successfully', async () => {
    const mockToken = '0x1234567890123456789012345678901234567890';
    (governance.instance.token as unknown as jest.Mock).mockResolvedValue(mockToken);

    const params: ITokenQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.token).toHaveBeenCalledWith();
    expect(result).toBe(mockToken);
  });

  it('should handle errors during token query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.token as unknown as jest.Mock).mockRejectedValue(error);

    const params: ITokenQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 