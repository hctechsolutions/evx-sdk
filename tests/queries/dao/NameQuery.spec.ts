import { NameQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { INameQueryParams } from '@interfaces/queries/params/INameQueryParams';

describe('NameQuery', () => {
  let query: NameQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        name: jest.fn()
      }
    } as any;

    query = new NameQuery(governance);
  });

  it('should execute name query successfully', async () => {
    const mockName = 'EvxDAO';
    (governance.instance.name as unknown as jest.Mock).mockResolvedValue(mockName);

    const params: INameQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.name).toHaveBeenCalledWith();
    expect(result).toBe(mockName);
  });

  it('should handle errors during name query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.name as unknown as jest.Mock).mockRejectedValue(error);

    const params: INameQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
