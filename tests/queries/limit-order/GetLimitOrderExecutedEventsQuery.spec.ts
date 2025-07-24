import { GetLimitOrderExecutedEventsQuery } from '@queries/limit-order';
import { LimitOrderExecutorContract } from '@contracts';
import { IGetLimitOrderExecutedEventsQueryParams } from '@interfaces/queries/params/IGetLimitOrderExecutedEventsQueryParams';

describe('GetLimitOrderExecutedEventsQuery', () => {
  let query: GetLimitOrderExecutedEventsQuery;
  let limitOrderExecutor: jest.Mocked<LimitOrderExecutorContract>;

  beforeEach(() => {
    limitOrderExecutor = {
      instance: {
        filters: {
          LimitOrderExecuted: jest.fn(),
        },
        queryFilter: jest.fn(),
      },
    } as any;

    query = new GetLimitOrderExecutedEventsQuery(limitOrderExecutor);
  });

  it('should execute executed events query successfully', async () => {
    const mockEvent = {
      args: [
        'orderId1', 'user1', 2000n, 1850n
      ],
      blockNumber: 123,
      transactionHash: '0xabc',
      index: 0
    };

    (limitOrderExecutor.instance.filters.LimitOrderExecuted as unknown as jest.Mock).mockReturnValue({});
    (limitOrderExecutor.instance.queryFilter as unknown as jest.Mock).mockResolvedValue([mockEvent]);

    const params: IGetLimitOrderExecutedEventsQueryParams = {
      fromBlock: 0,
      toBlock: 'latest'
    };

    const result = await query.execute(params);

    expect(limitOrderExecutor.instance.filters.LimitOrderExecuted).toHaveBeenCalledWith();
    expect(limitOrderExecutor.instance.queryFilter).toHaveBeenCalledWith({}, 0, 'latest');
    expect(result.events.length).toBe(1);
    expect(result.events[0].orderId).toBe('orderId1');
    expect(result.totalCount).toBe(1);
  });

  it('should filter by user when provided', async () => {
    const mockEvent = {
      args: [
        'orderId2', 'user2', 3000n, 1900n
      ],
      blockNumber: 124,
      transactionHash: '0xdef',
      index: 1
    };

    (limitOrderExecutor.instance.filters.LimitOrderExecuted as unknown as jest.Mock).mockReturnValue({});
    (limitOrderExecutor.instance.queryFilter as unknown as jest.Mock).mockResolvedValue([mockEvent]);

    const params: IGetLimitOrderExecutedEventsQueryParams = {
      fromBlock: 0,
      toBlock: 'latest',
      user: 'user2'
    };

    const result = await query.execute(params);

    expect(limitOrderExecutor.instance.filters.LimitOrderExecuted).toHaveBeenCalledWith(null, 'user2');
    expect(result.events[0].user).toBe('user2');
  });

  it('should return empty result when no events found', async () => {
    (limitOrderExecutor.instance.filters.LimitOrderExecuted as unknown as jest.Mock).mockReturnValue({});
    (limitOrderExecutor.instance.queryFilter as unknown as jest.Mock).mockResolvedValue([]);

    const params: IGetLimitOrderExecutedEventsQueryParams = {
      fromBlock: 0,
      toBlock: 'latest'
    };

    const result = await query.execute(params);

    expect(result.events.length).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it('should handle errors during query execution', async () => {
    const error = new Error('Query failed');
    
    (limitOrderExecutor.instance.filters.LimitOrderExecuted as unknown as jest.Mock).mockReturnValue({});
    (limitOrderExecutor.instance.queryFilter as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetLimitOrderExecutedEventsQueryParams = {
      fromBlock: 0,
      toBlock: 'latest'
    };

    await expect(query.execute(params)).rejects.toThrow('Failed to fetch limit order executed events: Query failed');
  });
}); 