import { VersionQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IVersionQueryParams } from '@interfaces/queries/params/IVersionQueryParams';

describe('VersionQuery', () => {
  let query: VersionQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        version: jest.fn(),
      },
    } as any;

    query = new VersionQuery(governance);
  });

  it('should execute version query successfully', async () => {
    const mockVersion = '1.0.0';
    (governance.instance.version as unknown as jest.Mock).mockResolvedValue(mockVersion);

    const params: IVersionQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.version).toHaveBeenCalledWith();
    expect(result).toBe(mockVersion);
  });

  it('should handle errors during version query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.version as unknown as jest.Mock).mockRejectedValue(error);

    const params: IVersionQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 