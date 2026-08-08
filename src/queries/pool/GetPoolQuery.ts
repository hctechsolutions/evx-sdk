import { IGetPoolOutput } from '@interfaces/queries/outputs/IGetPoolOutput';
import { IGetPoolParams } from '@interfaces/queries/params/IGetPoolParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Get Pool Query
 * @notice Retrieves pool information and configuration
 * @dev Queries the pool contract to get token addresses, fee tier, and other pool parameters
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetPoolQuery implements IBaseQuery<IGetPoolParams, IGetPoolOutput> {
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the query to get pool information
   * @param params The parameters for the query
   * @returns Pool information including token addresses, fee tier, and configuration
   */
  async execute(params: IGetPoolParams): Promise<IGetPoolOutput> {
    const pool = new PoolContract(params.address, this.rpc);

    const [token0, token1, feeTier, tickSpacing, maxLiquidityPerTick] =
      await Promise.all([
        pool.instance.token0(),
        pool.instance.token1(),
        pool.instance.fee(),
        pool.instance.tickSpacing(),
        pool.instance.maxLiquidityPerTick()
      ]);

    return {
      token0,
      token1,
      feeTier,
      tickSpacing,
      maxLiquidityPerTick
    };
  }
}
