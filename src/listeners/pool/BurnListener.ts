import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IBurnEvent } from '@interfaces/events/pool/IBurnEvent';
import { EventLog } from 'ethers';

/**
 * @title Burn Event Listener
 * @notice Listens for Burn events from a EvxPool contract
 * @dev This listener monitors a pool contract for burn events
 */
@injectable()
@singleton()
export class BurnListener implements IEventListener<IBurnEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IBurnEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(callback: (event: IBurnEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.Burn();

    const handleEvent = async (
      owner: string,
      tickLower: number,
      tickUpper: number,
      amount: bigint,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const burnEvent: IBurnEvent = {
        owner,
        tickLower,
        tickUpper,
        amount,
        amount0,
        amount1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(burnEvent);
        } catch (error) {
          console.error('Error in Burn event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IBurnEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IBurnEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.poolContract.instance.removeAllListeners('Burn');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<IBurnEvent[]> {
    const filter = this.poolContract.instance.filters.Burn();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [owner, tickLower, tickUpper, amount, amount0, amount1] = event.args;
        return {
          owner,
          tickLower,
          tickUpper,
          amount,
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
