import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { ILimitOrderCancelledEvent } from '@interfaces/events/limitOrder/ILimitOrderCancelledEvent';
import { IGetLimitOrderCancelledEventsQueryParams } from '@interfaces/queries/params/IGetLimitOrderCancelledEventsQueryParams';
import { IGetLimitOrderCancelledEventsQueryOutput } from '@interfaces/queries/outputs/IGetLimitOrderCancelledEventsQueryOutput';

/**
 * @title Get Limit Order Cancelled Events Query
 * @notice Query to fetch historical LimitOrderCancelled events
 * @dev This query retrieves limit order cancellation events from the blockchain
 */
@injectable()
@singleton()
export class GetLimitOrderCancelledEventsQuery implements IBaseQuery<IGetLimitOrderCancelledEventsQueryParams, IGetLimitOrderCancelledEventsQueryOutput> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the query to get limit order cancelled events
   * @param params The query parameters
   * @returns Promise resolving to the events data
   */
  async execute(params: IGetLimitOrderCancelledEventsQueryParams): Promise<IGetLimitOrderCancelledEventsQueryOutput> {
    try {
      const filter = params.user 
        ? this.limitOrderExecutor.instance.filters.LimitOrderCancelled(null, params.user)
        : this.limitOrderExecutor.instance.filters.LimitOrderCancelled();

      const events = await this.limitOrderExecutor.instance.queryFilter(
        filter,
        params.fromBlock,
        params.toBlock
      );

      const limitOrderEvents: ILimitOrderCancelledEvent[] = events.map((event) => {
        if ('args' in event) {
          const [orderId, user] = event.args;
          return {
            orderId,
            user,
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
      throw new Error(`Failed to fetch limit order cancelled events: ${error.message}`);
    }
  }
} 