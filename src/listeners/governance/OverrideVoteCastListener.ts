import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IOverrideVoteCastEvent } from '@interfaces/events/governance/IOverrideVoteCastEvent';
import { EventLog } from 'ethers';

/**
 * @title Override Vote Cast Event Listener
 * @notice Listens for OverrideVoteCast events from the EvexGovernance contract
 * @dev This listener monitors the governance contract for override vote casting events
 */
@injectable()
@singleton()
export class OverrideVoteCastListener implements IEventListener<IOverrideVoteCastEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IOverrideVoteCastEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(EvexGovernanceContract)
    private readonly governanceContract: EvexGovernanceContract
  ) {}

  /**
   * @notice Start listening for OverrideVoteCast events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IOverrideVoteCastEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.OverrideVoteCast();

    const handleEvent = async (
      voter: string,
      proposalId: bigint,
      support: number,
      weight: bigint,
      reason: string,
      event: EventLog
    ) => {
      const overrideVoteCastEvent: IOverrideVoteCastEvent = {
        voter: voter,
        proposalId: proposalId,
        support: support,
        weight: weight,
        reason: reason,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(overrideVoteCastEvent);
        } catch (error) {
          console.error('Error in OverrideVoteCast event callback:', error);
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
  addCallback(callback: (event: IOverrideVoteCastEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IOverrideVoteCastEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('OverrideVoteCast');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical OverrideVoteCast events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IOverrideVoteCastEvent[]> {
    const filter = this.governanceContract.instance.filters.OverrideVoteCast();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [voter, proposalId, support, weight, reason] = event.args;

        return {
          voter: voter,
          proposalId: proposalId,
          support: support,
          weight: weight,
          reason: reason,
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
