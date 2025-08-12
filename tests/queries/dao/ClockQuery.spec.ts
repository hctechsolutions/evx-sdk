import { ClockQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IClockQueryParams } from '@interfaces/queries/params/IClockQueryParams';

describe('ClockQuery', () => {
  let query: ClockQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        clock: jest.fn()
      }
    } as any;

    query = new ClockQuery(governance);
  });

  it('should execute clock query successfully', async () => {
    const mockClockValue = BigInt(1234567890);
    (governance.instance.clock as unknown as jest.Mock).mockResolvedValue(mockClockValue);

    const params: IClockQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.clock).toHaveBeenCalledWith();
    expect(result).toBe(mockClockValue);
  });

  it('should handle errors during clock query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.clock as unknown as jest.Mock).mockRejectedValue(error);

    const params: IClockQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
