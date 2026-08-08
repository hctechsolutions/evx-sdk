import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IProposalQueuedEvent } from '@interfaces/events/governance/IProposalQueuedEvent';
import { EventLog } from 'ethers';

/**
 * @title Proposal Queued Event Listener
 * @notice Listens for ProposalQueued events from the Governance contract
 * @dev This listener monitors the governance contract for proposal queuing events
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ProposalQueuedListener implements IEventListener<IProposalQueuedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IProposalQueuedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(GovernanceContract)
    private readonly governanceContract: GovernanceContract
  ) {}

  /**
   * @notice Start listening for ProposalQueued events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IProposalQueuedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.ProposalQueued();

    const handleEvent = async (proposalId: bigint, etaSeconds: bigint, event: EventLog) => {
      const proposalQueuedEvent: IProposalQueuedEvent = {
        proposalId: proposalId,
        etaSeconds: etaSeconds,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(proposalQueuedEvent);
        } catch (error) {
          console.error('Error in ProposalQueued event callback:', error);
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
  addCallback(callback: (event: IProposalQueuedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IProposalQueuedEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('ProposalQueued');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical ProposalQueued events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IProposalQueuedEvent[]> {
    const filter = this.governanceContract.instance.filters.ProposalQueued();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [proposalId, etaSeconds] = event.args;

        return {
          proposalId: proposalId,
          etaSeconds: etaSeconds,
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
