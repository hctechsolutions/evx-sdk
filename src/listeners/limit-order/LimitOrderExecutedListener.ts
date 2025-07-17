import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ILimitOrderExecutedEvent } from '@interfaces/events/limitOrder/ILimitOrderExecutedEvent';
import { EventLog } from 'ethers';

/**
 * @title Limit Order Executed Event Listener
 * @notice Listens for LimitOrderExecuted events from the LimitOrderExecutor contract
 * @dev This listener monitors the limit order executor contract for limit order execution events
 */
@injectable()
@singleton()
export class LimitOrderExecutedListener implements IEventListener<ILimitOrderExecutedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ILimitOrderExecutedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  async start(callback: (event: ILimitOrderExecutedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.limitOrderExecutor.instance.filters.LimitOrderExecuted();

    const handleEvent = async (
      orderId: string,
      user: string,
      amountOut: bigint,
      executionPrice: bigint,
      event: EventLog
    ) => {
      const limitOrderExecutedEvent: ILimitOrderExecutedEvent = {
        orderId,
        user,
        amountOut,
        executionPrice,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(limitOrderExecutedEvent);
        } catch (error) {
          console.error('Error in LimitOrderExecuted event callback:', error);
        }
      }
    };

    this.limitOrderExecutor.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ILimitOrderExecutedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ILimitOrderExecutedEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.limitOrderExecutor.instance.removeAllListeners('LimitOrderExecuted');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<ILimitOrderExecutedEvent[]> {
    const filter = this.limitOrderExecutor.instance.filters.LimitOrderExecuted();
    const events = await this.limitOrderExecutor.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
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
  }

  get listening(): boolean {
    return this.isListening;
  }
}
