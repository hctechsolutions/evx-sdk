import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';
import { IEventListener } from '@interfaces/listeners/IEventListener';
import { IIncreaseLiquidityEvent } from '@interfaces/events/pool/IIncreaseLiquidityEvent';
import { EventLog } from 'ethers';

/**
 * @title IncreaseLiquidity Event Listener
 * @notice Listens for IncreaseLiquidity events from the NonfungiblePositionManager contract
 */
@injectable()
@singleton()
export class IncreaseLiquidityListener implements IEventListener<IIncreaseLiquidityEvent> {
  private isListening = false;
  private eventFilter: any;
  private callbacks: ((event: IIncreaseLiquidityEvent) => void | Promise<void>)[] = [];

  constructor(
    @inject(PositionManagerContract)
    private readonly positionManagerContract: PositionManagerContract
  ) {}

  async start(callback: (event: IIncreaseLiquidityEvent) => void | Promise<void>): Promise<void> {
    this.addCallback(callback);
    if (this.isListening) return;
    this.eventFilter = this.positionManagerContract.instance.filters.IncreaseLiquidity();
    const handleEvent = async (
      tokenId: bigint,
      liquidity: bigint,
      amount0: bigint,
      amount1: bigint,
      event: EventLog
    ) => {
      const increaseEvent: IIncreaseLiquidityEvent = {
        tokenId,
        liquidity,
        amount0,
        amount1,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index
      };
      for (const cb of this.callbacks) {
        try { await cb(increaseEvent); } catch (error) { console.error('Error in IncreaseLiquidity event callback:', error); }
      }
    };
    this.positionManagerContract.instance.on(this.eventFilter, handleEvent);
    this.isListening = true;
  }

  addCallback(callback: (event: IIncreaseLiquidityEvent) => void | Promise<void>): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: IIncreaseLiquidityEvent) => void | Promise<void>): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) this.callbacks.splice(index, 1);
  }

  stop(): void {
    if (!this.isListening) return;
    this.positionManagerContract.instance.removeAllListeners('IncreaseLiquidity');
    this.callbacks = [];
    this.isListening = false;
  }

  async getHistoricalEvents(fromBlock: number, toBlock?: number): Promise<IIncreaseLiquidityEvent[]> {
    const filter = this.positionManagerContract.instance.filters.IncreaseLiquidity();
    const events = await this.positionManagerContract.instance.queryFilter(filter, fromBlock, toBlock);
    return events.map((event) => {
      if ('args' in event) {
        const [tokenId, liquidity, amount0, amount1] = event.args;
        return {
          tokenId,
          liquidity,
          amount0,
          amount1,
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