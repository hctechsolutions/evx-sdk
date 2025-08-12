import { ProtocolTokenQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IProtocolTokenQueryParams } from '@interfaces/queries/params/IProtocolTokenQueryParams';

describe('ProtocolTokenQuery', () => {
  let query: ProtocolTokenQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        evxToken: jest.fn()
      }
    } as any;

    query = new ProtocolTokenQuery(governance);
  });

  it('should execute evxToken query successfully', async () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    (governance.instance.evxToken as unknown as jest.Mock).mockResolvedValue(mockAddress);

    const params: IProtocolTokenQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.evxToken).toHaveBeenCalledWith();
    expect(result).toBe(mockAddress);
  });

  it('should handle errors during evxToken query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.evxToken as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProtocolTokenQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
