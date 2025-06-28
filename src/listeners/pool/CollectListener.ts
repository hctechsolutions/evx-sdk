import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ICollectEvent } from '@interfaces/events/pool/ICollectEvent';
import { EventLog } from 'ethers';

/**
 * @title Collect Event Listener
 * @notice Listens for Collect events from the NebularPool contract
 * @dev This listener monitors the pool contract for collect events
 */
@injectable()
@singleton()
export class CollectListener implements IEventListener<ICollectEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ICollectEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  /**
   * @notice Start listening for Collect events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: ICollectEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.Collect();

    const handleEvent = async (
      owner: string,
      recipient: string,
      tickLower: number,
      tickUpper: number,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const collectEvent: ICollectEvent = {
        owner,
        recipient,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(collectEvent);
        } catch (error) {
          console.error('Error in Collect event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ICollectEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ICollectEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }
    this.poolContract.instance.removeAllListeners('Collect');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | "latest"): Promise<ICollectEvent[]> {
    const filter = this.poolContract.instance.filters.Collect();
    const events = await this.poolContract.instance.queryFilter(
      filter,
      fromBlock,
      toBlock
    );

    return events.map((event) => {
      if ('args' in event) {
        const [owner, recipient, tickLower, tickUpper, amount0, amount1] = event.args;
        return {
          owner,
          recipient,
          tickLower,
          tickUpper,
          amount0,
          amount1,
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
