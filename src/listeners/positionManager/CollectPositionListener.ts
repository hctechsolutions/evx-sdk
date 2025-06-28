import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ICollectPositionEvent } from '@interfaces/events/pool/ICollectPositionEvent';
import { EventLog } from 'ethers';

/**
 * @title Collect Position Event Listener
 * @notice Listens for Collect events from the NonfungiblePositionManager contract
 */
@injectable()
@singleton()
export class CollectPositionListener implements IEventListener<ICollectPositionEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ICollectPositionEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PositionManagerContract)
    private readonly positionManagerContract: PositionManagerContract
  ) {}

  async start(callback: (event: ICollectPositionEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);
    if (this.isListening) return;
    this.eventFilter = this.positionManagerContract.instance.filters.Collect();
    const handleEvent = async (
      tokenId: bigint,
      recipient: string,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const collectEvent: ICollectPositionEvent = {
        tokenId,
        recipient,
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
          console.error('Error in CollectPosition event callback:', error);
        }
      }
    };
    this.positionManagerContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ICollectPositionEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ICollectPositionEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) this.callbacks.splice(index, 1);
  }

  stop(): void {
    if (!this.isListening) return;
    this.positionManagerContract.instance.removeAllListeners('Collect');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number | "latest"): Promise<ICollectPositionEvent[]> {
    const filter = this.positionManagerContract.instance.filters.Collect();
    const events = await this.positionManagerContract.instance.queryFilter(
      filter,
      fromBlock,
      toBlock
    );
    return events.map((event) => {
      if ('args' in event) {
        const [tokenId, recipient, amount0, amount1] = event.args;
        return {
          tokenId,
          recipient,
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
