import { IGetSlot0QueryParams } from '@interfaces/queries/params/IGetSlot0QueryParams';
import { IGetSlot0Output } from '@interfaces/queries/outputs/IGetSlot0Output';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Get Slot0 Query
 * @notice Gets the current slot0 information from a pool
 * @dev Queries the pool contract's slot0 function to get the current price, tick, and state
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetSlot0Query implements IBaseQuery<IGetSlot0QueryParams, IGetSlot0Output> {
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the query to get the slot0 information
   * @param params The parameters for the query
   * @returns The current slot0 state including sqrt price, tick, and observation data
   */
  async execute(params: IGetSlot0QueryParams): Promise<IGetSlot0Output> {
    const pool = new PoolContract(params.poolAddress, this.rpc);

    const slot0 = await pool.instance.slot0.staticCall();

    return {
      sqrtPriceX96: slot0.sqrtPriceX96,
      tick: Number(slot0.tick),
      observationIndex: Number(slot0.observationIndex),
      observationCardinality: Number(slot0.observationCardinality),
      observationCardinalityNext: Number(slot0.observationCardinalityNext),
      feeProtocol: Number(slot0.feeProtocol),
      unlocked: slot0.unlocked
    };
  }
}
