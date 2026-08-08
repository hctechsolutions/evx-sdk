import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ICollectProtocolEvent } from '@interfaces/events/pool/ICollectProtocolEvent';
import { EventLog } from 'ethers';

/**
 * @title CollectProtocol Event Listener
 * @notice Listens for CollectProtocol events from a EvxPool contract
 * @dev This listener monitors a pool contract for collect protocol events
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class CollectProtocolListener implements IEventListener<ICollectProtocolEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ICollectProtocolEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  async start(callback: (event: ICollectProtocolEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.CollectProtocol();

    const handleEvent = async (
      sender: string,
      recipient: string,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const collectProtocolEvent: ICollectProtocolEvent = {
        sender,
        recipient,
        amount0,
        amount1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(collectProtocolEvent);
        } catch (error) {
          console.error('Error in CollectProtocol event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ICollectProtocolEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ICollectProtocolEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.poolContract.instance.removeAllListeners('CollectProtocol');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<ICollectProtocolEvent[]> {
    const filter = this.poolContract.instance.filters.CollectProtocol();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [sender, recipient, amount0, amount1] = event.args;
        return {
          sender,
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
