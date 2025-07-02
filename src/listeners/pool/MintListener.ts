import { injectable, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IMintEvent } from '@interfaces/events/pool/IMintEvent';
import { EventLog } from 'ethers';

/**
 * @title Mint Event Listener
 * @notice Listens for Mint events from multiple NebularPool contracts
 * @dev This listener monitors multiple pool contracts for mint events
 */
@injectable()
@singleton()
export class MintListener implements IEventListener<IMintEvent> {
  private isListening = false;
  private poolContracts: Map<string, PoolContract> = new Map();
  private callbacks: ((event: IMintEvent) => void | Promise<void>)[] = [];
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
   * @notice Start listening for Mint events from all monitored pools
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IMintEvent) => void | Promise<void>): Promise<void> {
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
    const eventFilter = poolContract.instance.filters.Mint();

    const handleEvent = async (
      sender: string,
      owner: string,
      tickLower: number,
      tickUpper: number,
      amount: bigint,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const mintEvent: IMintEvent = {
        sender,
        owner,
        tickLower,
        tickUpper,
        amount,
        amount0,
        amount1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index,
        poolAddress // Add pool address to identify which pool emitted the event
      };

      for (const cb of this.callbacks) {
        try {
          await cb(mintEvent);
        } catch (error) {
          console.error(`Error in Mint event callback for pool ${poolAddress}:`, error);
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
    const eventFilter = poolContract.instance.filters.Mint();
    poolContract.instance.removeAllListeners(eventFilter);
    this.eventHandlers.delete(poolAddress);
  }

  addCallback(callback: (event: IMintEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IMintEvent) => void | Promise<void>): void {
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

  async getHistoricalEvents(fromBlock: number, toBlock?: number | "latest", poolAddress?: string): Promise<IMintEvent[]> {
    const allEvents: IMintEvent[] = [];

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
   * @returns Array of mint events
   */
  private async getEventsFromPool(
    poolContract: PoolContract,
    fromBlock: number,
    toBlock?: number | "latest",
    poolAddress?: string
  ): Promise<IMintEvent[]> {
    const filter = poolContract.instance.filters.Mint();
    const events = await poolContract.instance.queryFilter(
      filter,
      fromBlock,
      toBlock
    );

    return events.map((event) => {
      if ('args' in event) {
        const [sender, owner, tickLower, tickUpper, amount, amount0, amount1] = event.args;
        return {
          sender,
          owner,
          tickLower,
          tickUpper,
          amount,
          amount0,
          amount1,
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
