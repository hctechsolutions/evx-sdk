import { CountingModeQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { ICountingModeQueryParams } from '@interfaces/queries/params/ICountingModeQueryParams';

describe('CountingModeQuery', () => {
  let query: CountingModeQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        COUNTING_MODE: jest.fn()
      }
    } as any;

    query = new CountingModeQuery(governance);
  });

  it('should execute counting mode query successfully', async () => {
    const mockCountingMode = '=bravo&from=default';
    (governance.instance.COUNTING_MODE as unknown as jest.Mock).mockResolvedValue(mockCountingMode);

    const params: ICountingModeQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.COUNTING_MODE).toHaveBeenCalledWith();
    expect(result).toBe(mockCountingMode);
  });

  it('should handle errors during counting mode query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.COUNTING_MODE as unknown as jest.Mock).mockRejectedValue(error);

    const params: ICountingModeQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
