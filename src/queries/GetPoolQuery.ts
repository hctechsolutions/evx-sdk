import { IGetPoolOutput } from '@interfaces/queries/outputs/IGetPoolOutput';
import { IGetPoolParams } from '@interfaces/queries/params/IGetPoolParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';

@injectable()
@singleton()
export class GetPoolQuery implements IBaseQuery<IGetPoolParams, IGetPoolOutput> {

  async execute(params: IGetPoolParams): Promise<IGetPoolOutput> {
    const pool = new PoolContract(params.address);

    const [token0, token1, feeTier, tickSpacing, maxLiquidityPerTick] = await Promise.all([
      pool.instance.token0(),
      pool.instance.token1(),
      pool.instance.fee(),
      pool.instance.tickSpacing(),
      pool.instance.maxLiquidityPerTick(),
    ]);

    return {
      token0,
      token1,
      feeTier,
      tickSpacing,
      maxLiquidityPerTick
    }
  }
}
