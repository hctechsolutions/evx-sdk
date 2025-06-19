import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IPoolCreatedEvent } from '@interfaces/events/factory/IPoolCreatedEvent';
import { EventLog } from 'ethers';

/**
 * @title Pool Created Event Listener
 * @notice Listens for PoolCreated events from the NebularFactory contract
 * @dev This listener monitors the factory contract for new pool creation events
 */
@injectable()
@singleton()
export class PoolCreatedListener implements IEventListener<IPoolCreatedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IPoolCreatedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(FactoryContract)
    private readonly factoryContract: FactoryContract
  ) {}

  /**
   * @notice Start listening for PoolCreated events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IPoolCreatedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.factoryContract.instance.filters.PoolCreated();

    const handleEvent = async (
      token0: string,
      token1: string,
      fee: bigint,
      tickSpacing: bigint,
      pool: string,
      event: EventLog
    ) => {
      const poolCreatedEvent: IPoolCreatedEvent = {
        token0,
        token1,
        fee: fee,
        tickSpacing: tickSpacing,
        pool,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(poolCreatedEvent);
        } catch (error) {
          console.error('Error in PoolCreated event callback:', error);
        }
      }
    };

    this.factoryContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  /**
   * @notice Add a callback to the listener
   * @param callback Function to call when event is received
   */
  addCallback(callback: (event: IPoolCreatedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IPoolCreatedEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * @notice Stop listening for events
   */
  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.factoryContract.instance.removeAllListeners('PoolCreated');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical PoolCreated events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(fromBlock: number, toBlock?: number): Promise<IPoolCreatedEvent[]> {
    const filter = this.factoryContract.instance.filters.PoolCreated();
    const events = await this.factoryContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [token0, token1, fee, tickSpacing, pool] = event.args;

        return {
          token0,
          token1,
          fee: fee,
          tickSpacing: tickSpacing,
          pool,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.index
        };
      }
      throw new Error('Invalid event format');
    });
  }

  /**
   * @notice Check if the listener is currently active
   */
  get listening(): boolean {
    return this.isListening;
  }
}
