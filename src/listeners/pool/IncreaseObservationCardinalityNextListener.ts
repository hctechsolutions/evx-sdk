import { injectable, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IIncreaseObservationCardinalityNextEvent } from '@interfaces/events/pool/IIncreaseObservationCardinalityNextEvent';
import { EventLog, ethers } from 'ethers';

/**
 * @title IncreaseObservationCardinalityNext Event Listener
 * @notice Listens for IncreaseObservationCardinalityNext events from multiple NebularPool contracts
 * @dev This listener monitors multiple pool contracts for observation cardinality increase events
 */
@injectable()
@singleton()
export class IncreaseObservationCardinalityNextListener
  implements IEventListener<IIncreaseObservationCardinalityNextEvent>
{
  private isListening = false;
  private poolContracts: Map<string, PoolContract> = new Map();
  private callbacks: ((event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>)[] = [];
  private eventHandlers: Map<string, any> = new Map();

  /**
   * @notice Add a pool contract to listen for events
   * @param poolAddress The address of the pool contract
   */
  addPool(poolAddress: string): void {
    if (this.poolContracts.has(poolAddress)) {
      console.warn(`Pool ${poolAddress} is already being monitored`);
      return;
    }

    const poolContract = new PoolContract(poolAddress);
    this.poolContracts.set(poolAddress, poolContract);

    // If already listening, start listening to this new pool
    if (this.isListening) {
      this.startListeningToPool(poolAddress, poolContract);
    }
  }

  /**
   * @notice Remove a pool contract from listening
   * @param poolAddress The address of the pool contract to remove
   */
  removePool(poolAddress: string): void {
    const poolContract = this.poolContracts.get(poolAddress);
    if (!poolContract) {
      console.warn(`Pool ${poolAddress} is not being monitored`);
      return;
    }

    // Stop listening to this specific pool
    if (this.isListening) {
      this.stopListeningToPool(poolAddress, poolContract);
    }

    this.poolContracts.delete(poolAddress);
    this.eventHandlers.delete(poolAddress);
  }

  /**
   * @notice Get all monitored pool addresses
   * @returns Array of pool addresses being monitored
   */
  getMonitoredPools(): string[] {
    return Array.from(this.poolContracts.keys());
  }

  /**
   * @notice Start listening for IncreaseObservationCardinalityNext events from all monitored pools
   * @param callback Function to call when event is received
   */
  async start(
    callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>
  ): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    // Start listening to all existing pools
    for (const [poolAddress, poolContract] of this.poolContracts) {
      this.startListeningToPool(poolAddress, poolContract);
    }

    this.isListening = true;
  }

  /**
   * @notice Start listening to a specific pool
   * @param poolAddress The address of the pool
   * @param poolContract The pool contract instance
   */
  private startListeningToPool(poolAddress: string, poolContract: PoolContract): void {
    const eventFilter = poolContract.instance.filters.IncreaseObservationCardinalityNext();

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
        logIndex: event.index,
        poolAddress // Add pool address to identify which pool emitted the event
      };

      for (const cb of this.callbacks) {
        try {
          await cb(increaseObservationCardinalityNextEvent);
        } catch (error) {
          console.error(`Error in IncreaseObservationCardinalityNext event callback for pool ${poolAddress}:`, error);
        }
      }
    };

    poolContract.instance.on(eventFilter, handleEvent);
    this.eventHandlers.set(poolAddress, handleEvent);
  }

  /**
   * @notice Stop listening to a specific pool
   * @param poolAddress The address of the pool
   * @param poolContract The pool contract instance
   */
  private stopListeningToPool(poolAddress: string, poolContract: PoolContract): void {
    const eventFilter = poolContract.instance.filters.IncreaseObservationCardinalityNext();
    poolContract.instance.removeAllListeners(eventFilter);
    this.eventHandlers.delete(poolAddress);
  }

  addCallback(
    callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>
  ): void {
    this.callbacks.push(callback);
  }

  removeCallback(
    callback: (event: IIncreaseObservationCardinalityNextEvent) => void | Promise<void>
  ): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    // Stop listening to all pools
    for (const [poolAddress, poolContract] of this.poolContracts) {
      this.stopListeningToPool(poolAddress, poolContract);
    }

    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | "latest", poolAddress?: string): Promise<IIncreaseObservationCardinalityNextEvent[]> {
    const allEvents: IIncreaseObservationCardinalityNextEvent[] = [];

    if (poolAddress) {
      // Get events from specific pool
      const poolContract = this.poolContracts.get(poolAddress);
      if (!poolContract) {
        throw new Error(`Pool ${poolAddress} is not being monitored`);
      }

      const events = await this.getEventsFromPool(poolContract, fromBlock, toBlock, poolAddress);
      allEvents.push(...events);
    } else {
      // Get events from all pools
      for (const [address, poolContract] of this.poolContracts) {
        const events = await this.getEventsFromPool(poolContract, fromBlock, toBlock, address);
        allEvents.push(...events);
      }
    }

    return allEvents;
  }

  /**
   * @notice Get historical events from a specific pool
   * @param poolContract The pool contract instance
   * @param fromBlock Starting block number
   * @param toBlock Ending block number
   * @param poolAddress The pool address
   * @returns Array of increase observation cardinality next events
   */
  private async getEventsFromPool(
    poolContract: PoolContract,
    fromBlock: number,
    toBlock?: number | "latest",
    poolAddress?: string
  ): Promise<IIncreaseObservationCardinalityNextEvent[]> {
    const filter = poolContract.instance.filters.IncreaseObservationCardinalityNext();
    const events = await poolContract.instance.queryFilter(
      filter,
      fromBlock,
      toBlock
    );

    return events.map((event) => {
      if ('args' in event) {
        const [observationCardinalityNextOld, observationCardinalityNextNew] = event.args;
        return {
          observationCardinalityNextOld,
          observationCardinalityNextNew,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.index,
          poolAddress
        };
      }
      throw new Error('Invalid event format');
    });
  }

  get listening(): boolean {
    return this.isListening;
  }
}
