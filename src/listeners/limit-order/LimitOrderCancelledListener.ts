import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ILimitOrderCancelledEvent } from '@interfaces/events/limitOrder/ILimitOrderCancelledEvent';
import { EventLog } from 'ethers';

/**
 * @title Limit Order Cancelled Event Listener
 * @notice Listens for LimitOrderCancelled events from the LimitOrderExecutor contract
 * @dev This listener monitors the limit order executor contract for limit order cancellation events
 */
@injectable()
@singleton()
export class LimitOrderCancelledListener implements IEventListener<ILimitOrderCancelledEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ILimitOrderCancelledEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  async start(callback: (event: ILimitOrderCancelledEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.limitOrderExecutor.instance.filters.LimitOrderCancelled();

    const handleEvent = async (
      orderId: string,
      user: string,
      event: EventLog
    ) => {
      const limitOrderCancelledEvent: ILimitOrderCancelledEvent = {
        orderId,
        user,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(limitOrderCancelledEvent);
        } catch (error) {
          console.error('Error in LimitOrderCancelled event callback:', error);
        }
      }
    };

    this.limitOrderExecutor.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ILimitOrderCancelledEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ILimitOrderCancelledEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.limitOrderExecutor.instance.removeAllListeners('LimitOrderCancelled');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<ILimitOrderCancelledEvent[]> {
    const filter = this.limitOrderExecutor.instance.filters.LimitOrderCancelled();
    const events = await this.limitOrderExecutor.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
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
  }

  get listening(): boolean {
    return this.isListening;
  }
}
