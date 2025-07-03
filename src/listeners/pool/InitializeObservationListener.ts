import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IInitializeObservationEvent } from '@interfaces/events/pool/IInitializeObservationEvent';
import { EventLog } from 'ethers';

/**
 * @title InitializeObservation Event Listener
 * @notice Listens for InitializeObservation events from a NebularPool contract
 * @dev This listener monitors a pool contract for initialize observation events
 */
@injectable()
@singleton()
export class InitializeObservationListener implements IEventListener<IInitializeObservationEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IInitializeObservationEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(
    callback: (event: IInitializeObservationEvent) => void | Promise<void>
  ): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.InitializeObservation();

    const handleEvent = async (sqrtPriceX96: bigint, tick: number, event: EventLog) => {
      const initializeObservationEvent: IInitializeObservationEvent = {
        sqrtPriceX96,
        tick,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(initializeObservationEvent);
        } catch (error) {
          console.error('Error in InitializeObservation event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IInitializeObservationEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IInitializeObservationEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.poolContract.instance.removeAllListeners('InitializeObservation');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IInitializeObservationEvent[]> {
    const filter = this.poolContract.instance.filters.InitializeObservation();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [sqrtPriceX96, tick] = event.args;
        return {
          sqrtPriceX96,
          tick,
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
