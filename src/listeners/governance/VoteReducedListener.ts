import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IVoteReducedEvent } from '@interfaces/events/governance/IVoteReducedEvent';
import { EventLog } from 'ethers';

/**
 * @title Vote Reduced Event Listener
 * @notice Listens for VoteReduced events from the NebularGovernance contract
 * @dev This listener monitors the governance contract for vote reduction events
 */
@injectable()
@singleton()
export class VoteReducedListener implements IEventListener<IVoteReducedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IVoteReducedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(NebularGovernanceContract)
    private readonly governanceContract: NebularGovernanceContract
  ) {}

  /**
   * @notice Start listening for VoteReduced events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IVoteReducedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.VoteReduced();

    const handleEvent = async (
      delegate: string,
      proposalId: bigint,
      support: number,
      weight: bigint,
      event: EventLog
    ) => {
      const voteReducedEvent: IVoteReducedEvent = {
        delegate: delegate,
        proposalId: proposalId,
        support: support,
        weight: weight,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(voteReducedEvent);
        } catch (error) {
          console.error('Error in VoteReduced event callback:', error);
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
  addCallback(callback: (event: IVoteReducedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IVoteReducedEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('VoteReduced');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical VoteReduced events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(fromBlock: number, toBlock?: number): Promise<IVoteReducedEvent[]> {
    const filter = this.governanceContract.instance.filters.VoteReduced();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [delegate, proposalId, support, weight] = event.args;

        return {
          delegate: delegate,
          proposalId: proposalId,
          support: support,
          weight: weight,
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
