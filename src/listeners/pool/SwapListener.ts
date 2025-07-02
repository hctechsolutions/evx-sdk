import { injectable, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ISwapEvent } from '@interfaces/events/pool/ISwapEvent';
import { EventLog } from 'ethers';

/**
 * @title Swap Event Listener
 * @notice Listens for Swap events from multiple NebularPool contracts
 * @dev This listener monitors multiple pool contracts for swap events
 */
@injectable()
@singleton()
export class SwapListener implements IEventListener<ISwapEvent> {
  private isListening = false;
  private poolContracts = new Map<string, PoolContract>();
  private callbacks: ((event: ISwapEvent) => void | Promise<void>)[] = [];
  private eventHandlers = new Map<string, any>();

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
   * @notice Start listening for Swap events from all monitored pools
   * @param callback Function to call when event is received
   */
  async start(callback: (event: ISwapEvent) => void | Promise<void>): Promise<void> {
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
    const eventFilter = poolContract.instance.filters.Swap();

    const handleEvent = async (
      sender: string,
      recipient: string,
      amount0: bigint,
      amount1: bigint,
      sqrtPriceX96: bigint,
      liquidity: bigint,
      tick: number,
      event: EventLog
    ) => {
      const swapEvent: ISwapEvent = {
        sender,
        recipient,
        amount0,
        amount1,
        sqrtPriceX96,
        liquidity,
        tick,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index,
        poolAddress // Add pool address to identify which pool emitted the event
      };

      for (const cb of this.callbacks) {
        try {
          await cb(swapEvent);
        } catch (error) {
          console.error(`Error in Swap event callback for pool ${poolAddress}:`, error);
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
    const eventFilter = poolContract.instance.filters.Swap();
    poolContract.instance.removeAllListeners(eventFilter);
    this.eventHandlers.delete(poolAddress);
  }

  addCallback(callback: (event: ISwapEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ISwapEvent) => void | Promise<void>): void {
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

  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest',
    poolAddress?: string
  ): Promise<ISwapEvent[]> {
    const allEvents: ISwapEvent[] = [];

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
   * @returns Array of swap events
   */
  private async getEventsFromPool(
    poolContract: PoolContract,
    fromBlock: number,
    toBlock?: number | 'latest',
    poolAddress?: string
  ): Promise<ISwapEvent[]> {
    const filter = poolContract.instance.filters.Swap();
    const events = await poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick] = event.args;
        return {
          sender,
          recipient,
          amount0,
          amount1,
          sqrtPriceX96,
          liquidity,
          tick,
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
