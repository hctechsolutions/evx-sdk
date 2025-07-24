import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { IGetLimitOrderExecutedEventsQueryParams } from '@interfaces/queries/params/IGetLimitOrderExecutedEventsQueryParams';
import { IGetLimitOrderExecutedEventsQueryOutput } from '@interfaces/queries/outputs/IGetLimitOrderExecutedEventsQueryOutput';
import { ILimitOrderExecutedEvent } from '@interfaces/events/limitOrder/ILimitOrderExecutedEvent';

/**
 * @title Get Limit Order Executed Events Query
 * @notice Query to fetch historical LimitOrderExecuted events
 * @dev This query retrieves limit order execution events from the blockchain
 */
@injectable()
@singleton()
export class GetLimitOrderExecutedEventsQuery implements IBaseQuery<IGetLimitOrderExecutedEventsQueryParams, IGetLimitOrderExecutedEventsQueryOutput> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the query to get limit order executed events
   * @param params The query parameters
   * @returns Promise resolving to the events data
   */
  async execute(params: IGetLimitOrderExecutedEventsQueryParams): Promise<IGetLimitOrderExecutedEventsQueryOutput> {
    try {
      const filter = params.user 
        ? this.limitOrderExecutor.instance.filters.LimitOrderExecuted(null, params.user)
        : this.limitOrderExecutor.instance.filters.LimitOrderExecuted();

      const events = await this.limitOrderExecutor.instance.queryFilter(
        filter,
        params.fromBlock,
        params.toBlock
      );

      const limitOrderEvents: ILimitOrderExecutedEvent[] = events.map((event) => {
        if ('args' in event) {
          const [orderId, user, amountOut, executionPrice] = event.args;
          return {
            orderId,
            user,
            amountOut,
            executionPrice,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            logIndex: event.index
          };
        }
        throw new Error('Invalid event format');
      });

      return {
        events: limitOrderEvents,
        totalCount: limitOrderEvents.length,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock || 'latest'
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch limit order executed events: ${error.message}`);
    }
  }
} 