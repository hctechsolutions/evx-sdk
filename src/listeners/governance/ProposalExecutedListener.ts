import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IProposalExecutedEvent } from '@interfaces/events/governance/IProposalExecutedEvent';
import { EventLog } from 'ethers';

/**
 * @title Proposal Executed Event Listener
 * @notice Listens for ProposalExecuted events from the NebularGovernance contract
 * @dev This listener monitors the governance contract for proposal execution events
 */
@injectable()
@singleton()
export class ProposalExecutedListener implements IEventListener<IProposalExecutedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IProposalExecutedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(NebularGovernanceContract)
    private readonly governanceContract: NebularGovernanceContract
  ) {}

  /**
   * @notice Start listening for ProposalExecuted events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IProposalExecutedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.ProposalExecuted();

    const handleEvent = async (proposalId: bigint, event: EventLog) => {
      const proposalExecutedEvent: IProposalExecutedEvent = {
        proposalId: proposalId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(proposalExecutedEvent);
        } catch (error) {
          console.error('Error in ProposalExecuted event callback:', error);
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
  addCallback(callback: (event: IProposalExecutedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IProposalExecutedEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('ProposalExecuted');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical ProposalExecuted events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IProposalExecutedEvent[]> {
    const filter = this.governanceContract.instance.filters.ProposalExecuted();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [proposalId] = event.args;

        return {
          proposalId: proposalId,
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
