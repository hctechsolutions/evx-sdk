import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ILimitOrderCreatedEvent } from '@interfaces/events/limitOrder/ILimitOrderCreatedEvent';
import { EventLog } from 'ethers';

/**
 * @title Limit Order Created Event Listener
 * @notice Listens for LimitOrderCreated events from the LimitOrderExecutor contract
 * @dev This listener monitors the limit order executor contract for limit order creation events
 */
@injectable()
@singleton()
export class LimitOrderCreatedListener implements IEventListener<ILimitOrderCreatedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ILimitOrderCreatedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  async start(callback: (event: ILimitOrderCreatedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.limitOrderExecutor.instance.filters.LimitOrderCreated();

    const handleEvent = async (
      orderId: string,
      user: string,
      tokenIn: string,
      tokenOut: string,
      amountIn: bigint,
      minAmountOut: bigint,
      fee: number,
      targetPrice: bigint,
      deadline: bigint,
      taskId: string,
      event: EventLog
    ) => {
      const limitOrderCreatedEvent: ILimitOrderCreatedEvent = {
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

      for (const cb of this.callbacks) {
        try {
          await cb(limitOrderCreatedEvent);
        } catch (error) {
          console.error('Error in LimitOrderCreated event callback:', error);
        }
      }
    };

    this.limitOrderExecutor.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ILimitOrderCreatedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ILimitOrderCreatedEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.limitOrderExecutor.instance.removeAllListeners('LimitOrderCreated');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<ILimitOrderCreatedEvent[]> {
    const filter = this.limitOrderExecutor.instance.filters.LimitOrderCreated();
    const events = await this.limitOrderExecutor.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
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
  }

  get listening(): boolean {
    return this.isListening;
  }
}
