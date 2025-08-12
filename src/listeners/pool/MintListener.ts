import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IMintEvent } from '@interfaces/events/pool/IMintEvent';
import { EventLog } from 'ethers';

/**
 * @title Mint Event Listener
 * @notice Listens for Mint events from a EvxPool contract
 * @dev This listener monitors a pool contract for mint events
 */
@injectable()
@singleton()
export class MintListener implements IEventListener<IMintEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IMintEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(callback: (event: IMintEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.Mint();

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
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(mintEvent);
        } catch (error) {
          console.error('Error in Mint event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
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

    this.poolContract.instance.removeAllListeners('Mint');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<IMintEvent[]> {
    const filter = this.poolContract.instance.filters.Mint();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

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
