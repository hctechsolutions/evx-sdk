import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ILimitOrderFailedEvent } from '@interfaces/events/limitOrder/ILimitOrderFailedEvent';
import { EventLog } from 'ethers';

/**
 * @title Limit Order Failed Event Listener
 * @notice Listens for LimitOrderFailed events from the LimitOrderExecutor contract
 * @dev This listener monitors the limit order executor contract for limit order failure events
 */
@injectable()
@singleton()
export class LimitOrderFailedListener implements IEventListener<ILimitOrderFailedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ILimitOrderFailedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  async start(callback: (event: ILimitOrderFailedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.limitOrderExecutor.instance.filters.LimitOrderFailed();

    const handleEvent = async (
      orderId: string,
      user: string,
      reason: string,
      event: EventLog
    ) => {
      const limitOrderFailedEvent: ILimitOrderFailedEvent = {
        orderId,
        user,
        reason,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(limitOrderFailedEvent);
        } catch (error) {
          console.error('Error in LimitOrderFailed event callback:', error);
        }
      }
    };

    this.limitOrderExecutor.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ILimitOrderFailedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ILimitOrderFailedEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.limitOrderExecutor.instance.removeAllListeners('LimitOrderFailed');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<ILimitOrderFailedEvent[]> {
    const filter = this.limitOrderExecutor.instance.filters.LimitOrderFailed();
    const events = await this.limitOrderExecutor.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [orderId, user, reason] = event.args;
        return {
          orderId,
          user,
          reason,
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
