import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ISwapEvent } from '@interfaces/events/pool/ISwapEvent';
import { EventLog } from 'ethers';

/**
 * @title Swap Event Listener
 * @notice Listens for Swap events from a EvxPool contract
 * @dev This listener monitors a pool contract for swap events
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class SwapListener implements IEventListener<ISwapEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ISwapEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(callback: (event: ISwapEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.Swap();

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
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(swapEvent);
        } catch (error) {
          console.error('Error in Swap event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
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

    this.poolContract.instance.removeAllListeners('Swap');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | 'latest'): Promise<ISwapEvent[]> {
    const filter = this.poolContract.instance.filters.Swap();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

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
