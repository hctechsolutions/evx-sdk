import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { AirdropDistributorContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IClaimedEvent } from '@interfaces/events/airdrop/IClaimedEvent';
import { EventLog } from 'ethers';

/**
 * @title Claimed Event Listener
 * @notice Listens for Claimed events from the AirdropDistributor contract
 * @dev Mapped by Platform ingest to operationType `airdrop.claim` (D12)
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ClaimedListener implements IEventListener<IClaimedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IClaimedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(AirdropDistributorContract)
    private readonly distributor: AirdropDistributorContract
  ) {}

  async start(callback: (event: IClaimedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.distributor.instance.filters.Claimed();

    const handleEvent = async (
      index: bigint,
      account: string,
      amount: bigint,
      event: EventLog
    ) => {
      const claimedEvent: IClaimedEvent = {
        index,
        account,
        amount,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(claimedEvent);
        } catch (error) {
          console.error('Error in Claimed event callback:', error);
        }
      }
    };

    this.distributor.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IClaimedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IClaimedEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.distributor.instance.removeAllListeners('Claimed');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IClaimedEvent[]> {
    const filter = this.distributor.instance.filters.Claimed();
    const events = await this.distributor.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [index, account, amount] = event.args;

        return {
          index,
          account,
          amount,
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
