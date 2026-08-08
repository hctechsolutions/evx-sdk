import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IVoteCastWithParamsEvent } from '@interfaces/events/governance/IVoteCastWithParamsEvent';
import { EventLog } from 'ethers';

/**
 * @title Vote Cast With Params Event Listener
 * @notice Listens for VoteCastWithParams events from the Governance contract
 * @dev This listener monitors the governance contract for vote casting events with additional parameters
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class VoteCastWithParamsListener implements IEventListener<IVoteCastWithParamsEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IVoteCastWithParamsEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(GovernanceContract)
    private readonly governanceContract: GovernanceContract
  ) {}

  /**
   * @notice Start listening for VoteCastWithParams events
   * @param callback Function to call when event is received
   */
  async start(callback: (event: IVoteCastWithParamsEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);

    if (this.isListening) {
      return;
    }

    this.eventFilter = this.governanceContract.instance.filters.VoteCastWithParams();

    const handleEvent = async (
      voter: string,
      proposalId: bigint,
      support: number,
      weight: bigint,
      reason: string,
      params: string,
      event: EventLog
    ) => {
      const voteCastWithParamsEvent: IVoteCastWithParamsEvent = {
        voter: voter,
        proposalId: proposalId,
        support: support,
        weight: weight,
        reason: reason,
        params: params,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };

      // Execute all callbacks
      for (const cb of this.callbacks) {
        try {
          await cb(voteCastWithParamsEvent);
        } catch (error) {
          console.error('Error in VoteCastWithParams event callback:', error);
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
  addCallback(callback: (event: IVoteCastWithParamsEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  /**
   * @notice Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: IVoteCastWithParamsEvent) => void | Promise<void>): void {
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

    this.governanceContract.instance.removeAllListeners('VoteCastWithParams');
    this.callbacks = [];
    this.isListening = false;
  }

  /**
   * @notice Get historical VoteCastWithParams events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   */
  async getHistoricalEvents(
    fromBlock: number,
    toBlock?: number | 'latest'
  ): Promise<IVoteCastWithParamsEvent[]> {
    const filter = this.governanceContract.instance.filters.VoteCastWithParams();
    const events = await this.governanceContract.instance.queryFilter(filter, fromBlock, toBlock);

    return events.map((event) => {
      if ('args' in event) {
        const [voter, proposalId, support, weight, reason, params] = event.args;

        return {
          voter: voter,
          proposalId: proposalId,
          support: support,
          weight: weight,
          reason: reason,
          params: params,
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
