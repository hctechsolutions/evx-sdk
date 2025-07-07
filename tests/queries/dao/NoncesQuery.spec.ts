import { NoncesQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { INoncesQueryParams } from '@interfaces/queries/params/INoncesQueryParams';

describe('NoncesQuery', () => {
  let query: NoncesQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        nonces: jest.fn(),
      },
    } as any;

    query = new NoncesQuery(governance);
  });

  it('should execute nonces query successfully', async () => {
    const mockNonce = BigInt(5);
    (governance.instance.nonces as unknown as jest.Mock).mockResolvedValue(mockNonce);

    const params: INoncesQueryParams = {
      owner: '0x1234567890123456789012345678901234567890',
    };

    const result = await query.execute(params);

    expect(governance.instance.nonces).toHaveBeenCalledWith(params.owner);
    expect(result).toBe(mockNonce);
  });

  it('should handle errors during nonces query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.nonces as unknown as jest.Mock).mockRejectedValue(error);

    const params: INoncesQueryParams = {
      owner: '0x1234567890123456789012345678901234567890',
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 