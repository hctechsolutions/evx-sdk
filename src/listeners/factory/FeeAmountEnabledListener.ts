import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IFeeAmountEnabledEvent } from '@interfaces/events/factory/IFeeAmountEnabledEvent';
import { EventLog } from 'ethers';

/**
 * @title Fee Amount Enabled Event Listener
 * @notice Listens for FeeAmountEnabled events from the EvexFactory contract
 * @dev This listener monitors the factory contract for fee amount enablement events
 */
@injectable()
@singleton()
export class FeeAmountEnabledListener implements IEventListener<IFeeAmountEnabledEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IFeeAmountEnabledEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(FactoryContract)
    private readonly factoryContract: FactoryContract
  ) {}

  /**
   * @notice Start listening for FeeAmountEnabled events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IFeeAmountEnabledEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.factoryContract.instance.filters.FeeAmountEnabled();

    const handleEvent = async (fee: bigint, tickSpacing: bigint, event: EventLog) => {
      const feeAmountEnabledEvent: IFeeAmountEnabledEvent = {
        fee: fee,
        tickSpacing: tickSpacing,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(feeAmountEnabledEvent);
        } catch (error) {
          console.error('Error in FeeAmountEnabled event callback:', error);
        }
      }
    };

    this.factoryContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  /**
   * @notice Add a callback to the listener
   * @param callback Function to call when event is received
   */
  addCallback(callback: (event: IFeeAmountEnabledEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IFeeAmountEnabledEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * @notice Stop listening for events
   */
  stop(): void {
    if (!this.isListening) {
      return;
    }

    this.factoryContract.instance.removeAllListeners('FeeAmountEnabled');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical FeeAmountEnabled events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IFeeAmountEnabledEvent[]> {
    const filter = this.factoryContract.instance.filters.FeeAmountEnabled();
    const events = await this.factoryContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [fee, tickSpacing] = event.args;

        return {
          fee: fee,
          tickSpacing: tickSpacing,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.index
        };
      }
      throw new Error('Invalid event format');
    });
  }

  /**
   * @notice Check if the listener is currently active
   */
  get listening(): boolean {
    return this.isListening;
  }
}
