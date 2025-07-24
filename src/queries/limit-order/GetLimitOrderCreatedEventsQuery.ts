import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { ILimitOrderCreatedEvent } from '@interfaces/events/limitOrder/ILimitOrderCreatedEvent';
import { IGetLimitOrderCreatedEventsQueryParams } from '@interfaces/queries/params/IGetLimitOrderCreatedEventsQueryParams';
import { IGetLimitOrderCreatedEventsQueryOutput } from '@interfaces/queries/outputs/IGetLimitOrderCreatedEventsQueryOutput';

/**
 * @title Get Limit Order Created Events Query
 * @notice Query to fetch historical LimitOrderCreated events
 * @dev This query retrieves limit order creation events from the blockchain
 */
@injectable()
@singleton()
export class GetLimitOrderCreatedEventsQuery implements IBaseQuery<IGetLimitOrderCreatedEventsQueryParams, IGetLimitOrderCreatedEventsQueryOutput> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the query to get limit order created events
   * @param params The query parameters
   * @returns Promise resolving to the events data
   */
  async execute(params: IGetLimitOrderCreatedEventsQueryParams): Promise<IGetLimitOrderCreatedEventsQueryOutput> {
    try {
      const filter = params.user 
        ? this.limitOrderExecutor.instance.filters.LimitOrderCreated(null, params.user)
        : this.limitOrderExecutor.instance.filters.LimitOrderCreated();

      const events = await this.limitOrderExecutor.instance.queryFilter(
        filter,
        params.fromBlock,
        params.toBlock
      );

      const limitOrderEvents: ILimitOrderCreatedEvent[] = events.map((event) => {
        if ('args' in event) {
          const [orderId, user, tokenIn, tokenOut, amountIn, minAmountOut, fee, targetPrice, deadline, taskId] = event.args;
          return {
            orderId,
            user,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            fee,
            targetPrice,
            deadline,
            taskId,
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
      throw new Error(`Failed to fetch limit order created events: ${error.message}`);
    }
  }
} 