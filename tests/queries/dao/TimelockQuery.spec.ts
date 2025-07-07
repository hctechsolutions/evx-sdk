import { TimelockQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { ITimelockQueryParams } from '@interfaces/queries/params/ITimelockQueryParams';

describe('TimelockQuery', () => {
  let query: TimelockQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        timelock: jest.fn(),
      },
    } as any;

    query = new TimelockQuery(governance);
  });

  it('should execute timelock query successfully', async () => {
    const mockTimelock = '0x1234567890123456789012345678901234567890';
    (governance.instance.timelock as unknown as jest.Mock).mockResolvedValue(mockTimelock);

    const params: ITimelockQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.timelock).toHaveBeenCalledWith();
    expect(result).toBe(mockTimelock);
  });

  it('should handle errors during timelock query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.timelock as unknown as jest.Mock).mockRejectedValue(error);

    const params: ITimelockQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 