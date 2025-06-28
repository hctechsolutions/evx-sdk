import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IProposalCanceledEvent } from '@interfaces/events/governance/IProposalCanceledEvent';
import { EventLog } from 'ethers';

/**
 * @title Proposal Canceled Event Listener
 * @notice Listens for ProposalCanceled events from the NebularGovernance contract
 * @dev This listener monitors the governance contract for proposal cancellation events
 */
@injectable()
@singleton()
export class ProposalCanceledListener implements IEventListener<IProposalCanceledEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IProposalCanceledEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(NebularGovernanceContract)
    private readonly governanceContract: NebularGovernanceContract
  ) {}

  /**
   * @notice Start listening for ProposalCanceled events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IProposalCanceledEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.ProposalCanceled();

    const handleEvent = async (proposalId: bigint, event: EventLog) => {
      const proposalCanceledEvent: IProposalCanceledEvent = {
        proposalId: proposalId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(proposalCanceledEvent);
        } catch (error) {
          console.error('Error in ProposalCanceled event callback:', error);
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
  addCallback(callback: (event: IProposalCanceledEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IProposalCanceledEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('ProposalCanceled');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical ProposalCanceled events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(fromBlock: number, toBlock?: number | "latest"): Promise<IProposalCanceledEvent[]> {
    const filter = this.governanceContract.instance.filters.ProposalCanceled();
    const events = await this.governanceContract.instance.queryFilter(
      filter,
      fromBlock,
      toBlock
    );

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
