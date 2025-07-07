import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IFlashEvent } from '@interfaces/events/pool/IFlashEvent';
import { EventLog } from 'ethers';

/**
 * @title Flash Event Listener
 * @notice Listens for Flash events from a EvexPool contract
 * @dev This listener monitors a pool contract for flash events
 */
@injectable()
@singleton()
export class FlashListener implements IEventListener<IFlashEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IFlashEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(callback: (event: IFlashEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.Flash();

    const handleEvent = async (
      sender: string,
      recipient: string,
      amount0: bigint,
      amount1: bigint,
      paid0: bigint,
      paid1: bigint,
      event: EventLog
    ) => {
      const flashEvent: IFlashEvent = {
        sender,
        recipient,
        amount0,
        amount1,
        paid0,
        paid1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(flashEvent);
        } catch (error) {
          console.error('Error in Flash event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IFlashEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IFlashEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.poolContract.instance.removeAllListeners('Flash');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IFlashEvent[]> {
    const filter = this.poolContract.instance.filters.Flash();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [sender, recipient, amount0, amount1, paid0, paid1] = event.args;
        return {
          sender,
          recipient,
          amount0,
          amount1,
          paid0,
          paid1,
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
