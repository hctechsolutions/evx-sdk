import { EvxTokenQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IEvxTokenQueryParams } from '@interfaces/queries/params/IEvxTokenQueryParams';

describe('EvxTokenQuery', () => {
  let query: EvxTokenQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        evxToken: jest.fn(),
      },
    } as any;

    query = new EvxTokenQuery(governance);
  });

  it('should execute evxToken query successfully', async () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    (governance.instance.evxToken as unknown as jest.Mock).mockResolvedValue(mockAddress);

    const params: IEvxTokenQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.evxToken).toHaveBeenCalledWith();
    expect(result).toBe(mockAddress);
  });

  it('should handle errors during evxToken query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.evxToken as unknown as jest.Mock).mockRejectedValue(error);

    const params: IEvxTokenQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 