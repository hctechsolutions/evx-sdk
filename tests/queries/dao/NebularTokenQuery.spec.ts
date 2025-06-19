import { NebularTokenQuery } from '@queries/dao';
import { NebularGovernanceContract } from '@contracts';
import { INebularTokenQueryParams } from '@interfaces/queries/params/INebularTokenQueryParams';

describe('NebularTokenQuery', () => {
  let query: NebularTokenQuery;
  let governance: jest.Mocked<NebularGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        nebularToken: jest.fn(),
      },
    } as any;

    query = new NebularTokenQuery(governance);
  });

  it('should execute nebularToken query successfully', async () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    (governance.instance.nebularToken as unknown as jest.Mock).mockResolvedValue(mockAddress);

    const params: INebularTokenQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.nebularToken).toHaveBeenCalledWith();
    expect(result).toBe(mockAddress);
  });

  it('should handle errors during nebularToken query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.nebularToken as unknown as jest.Mock).mockRejectedValue(error);

    const params: INebularTokenQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 