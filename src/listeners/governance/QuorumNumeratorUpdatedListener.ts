import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IQuorumNumeratorUpdatedEvent } from '@interfaces/events/governance/IQuorumNumeratorUpdatedEvent';
import { EventLog } from 'ethers';

/**
 * @title Quorum Numerator Updated Event Listener
 * @notice Listens for QuorumNumeratorUpdated events from the Governance contract
 * @dev This listener monitors the governance contract for quorum numerator update events
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class QuorumNumeratorUpdatedListener
  implements IEventListener<IQuorumNumeratorUpdatedEvent>
{
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IQuorumNumeratorUpdatedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(GovernanceContract)
    private readonly governanceContract: GovernanceContract
  ) {}

  /**
   * @notice Start listening for QuorumNumeratorUpdated events
   * @param callback Function to call when event is received
   */
  async start(
    callback: (event: IQuorumNumeratorUpdatedEvent) => void | Promise<void>
  ): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.QuorumNumeratorUpdated();

    const handleEvent = async (
      oldQuorumNumerator: bigint,
      newQuorumNumerator: bigint,
      event: EventLog
    ) => {
      const quorumNumeratorUpdatedEvent: IQuorumNumeratorUpdatedEvent = {
        oldQuorumNumerator: oldQuorumNumerator,
        newQuorumNumerator: newQuorumNumerator,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(quorumNumeratorUpdatedEvent);
        } catch (error) {
          console.error('Error in QuorumNumeratorUpdated event callback:', error);
        }
      }
    };

    this.governanceContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  /**
   * @notice Add a callback to the listener
   * @param callback Function to call when event is received
   */
  addCallback(callback: (event: IQuorumNumeratorUpdatedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IQuorumNumeratorUpdatedEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('QuorumNumeratorUpdated');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical QuorumNumeratorUpdated events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IQuorumNumeratorUpdatedEvent[]> {
    const filter = this.governanceContract.instance.filters.QuorumNumeratorUpdated();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [oldQuorumNumerator, newQuorumNumerator] = event.args;

        return {
          oldQuorumNumerator: oldQuorumNumerator,
          newQuorumNumerator: newQuorumNumerator,
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
