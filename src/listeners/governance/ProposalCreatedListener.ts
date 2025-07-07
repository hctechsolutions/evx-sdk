import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IProposalCreatedEvent } from '@interfaces/events/governance/IProposalCreatedEvent';
import { EventLog } from 'ethers';

/**
 * @title Proposal Created Event Listener
 * @notice Listens for ProposalCreated events from the EvexGovernance contract
 * @dev This listener monitors the governance contract for proposal creation events
 */
@injectable()
@singleton()
export class ProposalCreatedListener implements IEventListener<IProposalCreatedEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IProposalCreatedEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(EvexGovernanceContract)
    private readonly governanceContract: EvexGovernanceContract
  ) {}

  /**
   * @notice Start listening for ProposalCreated events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IProposalCreatedEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.ProposalCreated();

    const handleEvent = async (
      proposalId: bigint,
      proposer: string,
      targets: string[],
      values: bigint[],
      signatures: string[],
      calldatas: string[],
      voteStart: bigint,
      voteEnd: bigint,
      description: string,
      event: EventLog
    ) => {
      const proposalCreatedEvent: IProposalCreatedEvent = {
        proposalId: proposalId,
        proposer: proposer,
        targets: targets,
        values: values,
        signatures: signatures,
        calldatas: calldatas,
        voteStart: voteStart,
        voteEnd: voteEnd,
        description: description,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(proposalCreatedEvent);
        } catch (error) {
          console.error('Error in ProposalCreated event callback:', error);
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
  addCallback(callback: (event: IProposalCreatedEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IProposalCreatedEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('ProposalCreated');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical ProposalCreated events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IProposalCreatedEvent[]> {
    const filter = this.governanceContract.instance.filters.ProposalCreated();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [
          proposalId,
          proposer,
          targets,
          values,
          signatures,
          calldatas,
          voteStart,
          voteEnd,
          description
        ] = event.args;

        return {
          proposalId: proposalId,
          proposer: proposer,
          targets: targets,
          values: values,
          signatures: signatures,
          calldatas: calldatas,
          voteStart: voteStart,
          voteEnd: voteEnd,
          description: description,
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
