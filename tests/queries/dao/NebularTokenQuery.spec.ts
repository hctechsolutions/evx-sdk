import { EvexTokenQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IEvexTokenQueryParams } from '@interfaces/queries/params/IEvexTokenQueryParams';

describe('EvexTokenQuery', () => {
  let query: EvexTokenQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        evexToken: jest.fn(),
      },
    } as any;

    query = new EvexTokenQuery(governance);
  });

  it('should execute evexToken query successfully', async () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    (governance.instance.evexToken as unknown as jest.Mock).mockResolvedValue(mockAddress);

    const params: IEvexTokenQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.evexToken).toHaveBeenCalledWith();
    expect(result).toBe(mockAddress);
  });

  it('should handle errors during evexToken query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.evexToken as unknown as jest.Mock).mockRejectedValue(error);

    const params: IEvexTokenQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 