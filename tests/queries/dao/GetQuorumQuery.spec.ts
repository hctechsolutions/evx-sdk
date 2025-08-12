import { GetQuorumQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IGetQuorumQueryParams } from '@interfaces/queries/params/IGetQuorumQueryParams';

describe('GetQuorumQuery', () => {
  let query: GetQuorumQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        quorum: jest.fn()
      }
    } as any;

    query = new GetQuorumQuery(governance);
  });

  it('should execute quorum query successfully', async () => {
    const mockQuorum = BigInt(5000000); // Example quorum value
    const blockNumber = BigInt(12345678);

    (governance.instance.quorum as unknown as jest.Mock).mockResolvedValue(mockQuorum);

    const params: IGetQuorumQueryParams = {
      blockNumber
    };

    const result = await query.execute(params);

    expect(governance.instance.quorum).toHaveBeenCalledWith(blockNumber);
    expect(result).toBe(mockQuorum);
  });

  it('should handle errors during quorum query execution', async () => {
    const error = new Error('Query failed');
    const blockNumber = BigInt(12345678);

    (governance.instance.quorum as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetQuorumQueryParams = {
      blockNumber
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent quorum values for same block number', async () => {
    const mockQuorum = BigInt(5000000);
    const blockNumber = BigInt(12345678);

    (governance.instance.quorum as unknown as jest.Mock).mockResolvedValue(mockQuorum);

    const params: IGetQuorumQueryParams = {
      blockNumber
    };

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.quorum).toHaveBeenCalledTimes(2);
    expect(governance.instance.quorum).toHaveBeenCalledWith(blockNumber);
    expect(result1).toBe(mockQuorum);
    expect(result2).toBe(mockQuorum);
  });

  it('should handle different block numbers correctly', async () => {
    const mockQuorum1 = BigInt(5000000);
    const mockQuorum2 = BigInt(6000000);
    const blockNumber1 = BigInt(12345678);
    const blockNumber2 = BigInt(87654321);

    (governance.instance.quorum as unknown as jest.Mock)
      .mockResolvedValueOnce(mockQuorum1)
      .mockResolvedValueOnce(mockQuorum2);

    const params1: IGetQuorumQueryParams = { blockNumber: blockNumber1 };
    const params2: IGetQuorumQueryParams = { blockNumber: blockNumber2 };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.quorum).toHaveBeenCalledWith(blockNumber1);
    expect(governance.instance.quorum).toHaveBeenCalledWith(blockNumber2);
    expect(result1).toBe(mockQuorum1);
    expect(result2).toBe(mockQuorum2);
  });
});
