import { ClockModeQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IClockModeQueryParams } from '@interfaces/queries/params/IClockModeQueryParams';

describe('ClockModeQuery', () => {
  let query: ClockModeQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        CLOCK_MODE: jest.fn()
      }
    } as any;

    query = new ClockModeQuery(governance);
  });

  it('should execute clock mode query successfully', async () => {
    const mockClockMode = 'mode=blocknumber&from=default';
    (governance.instance.CLOCK_MODE as unknown as jest.Mock).mockResolvedValue(mockClockMode);

    const params: IClockModeQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.CLOCK_MODE).toHaveBeenCalledWith();
    expect(result).toBe(mockClockMode);
  });

  it('should handle errors during clock mode query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.CLOCK_MODE as unknown as jest.Mock).mockRejectedValue(error);

    const params: IClockModeQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
