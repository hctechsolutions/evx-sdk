import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IIncreaseObservationCardinalityNextEvent } from '@interfaces/events/pool/IIncreaseObservationCardinalityNextEvent';
import { EventLog } from 'ethers';

/**
 * @title IncreaseObservationCardinalityNext Event Listener
 * @notice Listens for IncreaseObservationCardinalityNext events from the NebularPool contract
 * @dev This listener monitors the pool contract for observation cardinality increase events
 */
@injectable()
@singleton()
export class IncreaseObservationCardinalityNextListener implements IEventListener<IIncreaseObservationCardinalityNextEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  /**
   * @notice Start listening for IncreaseObservationCardinalityNext events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.IncreaseObservationCardinalityNext();

    const handleEvent = async (
      observationCardinalityNextOld: number,
      observationCardinalityNextNew: number,
      event: EventLog
    ) => {
      const increaseObservationCardinalityNextEvent: IIncreaseObservationCardinalityNextEvent = {
        observationCardinalityNextOld,
        observationCardinalityNextNew,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(increaseObservationCardinalityNextEvent);
        } catch (error) {
          console.error('Error in IncreaseObservationCardinalityNext event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }
    this.poolContract.instance.removeAllListeners('IncreaseObservationCardinalityNext');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number): Promise<IIncreaseObservationCardinalityNextEvent[]> {
    const filter = this.poolContract.instance.filters.IncreaseObservationCardinalityNext();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [observationCardinalityNextOld, observationCardinalityNextNew] = event.args;
        return {
          observationCardinalityNextOld,
          observationCardinalityNextNew,
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