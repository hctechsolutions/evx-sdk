import { injectable, inject, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { ISetFeeProtocolEvent } from '@interfaces/events/pool/ISetFeeProtocolEvent';
import { EventLog } from 'ethers';

/**
 * @title SetFeeProtocol Event Listener
 * @notice Listens for SetFeeProtocol events from the NebularPool contract
 * @dev This listener monitors the pool contract for set fee protocol events
 */
@injectable()
@singleton()
export class SetFeeProtocolListener implements IEventListener<ISetFeeProtocolEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: ISetFeeProtocolEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PoolContract)
    private readonly poolContract: PoolContract
  ) {}

  /**
   * @notice Start listening for SetFeeProtocol events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: ISetFeeProtocolEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.poolContract.instance.filters.SetFeeProtocol();

    const handleEvent = async (
      feeProtocol0Old: number,
      feeProtocol1Old: number,
      feeProtocol0New: number,
      feeProtocol1New: number,
      event: EventLog
    ) => {
      const setFeeProtocolEvent: ISetFeeProtocolEvent = {
        feeProtocol0Old,
        feeProtocol1Old,
        feeProtocol0New,
        feeProtocol1New,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      for (const cb of this.callbacks) {
        try {
          await cb(setFeeProtocolEvent);
        } catch (error) {
          console.error('Error in SetFeeProtocol event callback:', error);
        }
      }
    };

    this.poolContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: ISetFeeProtocolEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: ISetFeeProtocolEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }
    this.poolContract.instance.removeAllListeners('SetFeeProtocol');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number): Promise<ISetFeeProtocolEvent[]> {
    const filter = this.poolContract.instance.filters.SetFeeProtocol();
    const events = await this.poolContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [feeProtocol0Old, feeProtocol1Old, feeProtocol0New, feeProtocol1New] = event.args;
        return {
          feeProtocol0Old,
          feeProtocol1Old,
          feeProtocol0New,
          feeProtocol1New,
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