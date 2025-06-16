import { IGetPopulatedTicksQueryParams } from '@interfaces/queries/params/IGetPopulatedTicksQueryParams';
import { IGetPopulatedTicksOutput } from '@interfaces/queries/outputs/IGetPopulatedTicksOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { TickLensContract } from '@contracts';
import { TICK_BITMAP_INDEX } from '@resources';

/**
 * @title Get Populated Ticks Query
 * @notice Gets the populated ticks in a word for a given pool
 * @dev This query interacts with the TickLensContract to get the populated ticks
 */
@injectable()
@singleton()
export class GetPopulatedTicksQuery
  implements IBaseQuery<IGetPopulatedTicksQueryParams, IGetPopulatedTicksOutput>
{
  constructor(
    @inject(TickLensContract)
    private readonly tickLens: TickLensContract
  ) {}

  /**
   * @notice Executes the get populated ticks query
   * @param params The parameters for getting the populated ticks
   * @returns The populated ticks data
   * @throws Error if tickBitmapIndex is out of range
   */
  async execute(params: IGetPopulatedTicksQueryParams): Promise<IGetPopulatedTicksOutput> {
    if (
      params.tickBitmapIndex < TICK_BITMAP_INDEX.MIN ||
      params.tickBitmapIndex > TICK_BITMAP_INDEX.MAX
    ) {
      throw new Error(
        `tickBitmapIndex must be between ${TICK_BITMAP_INDEX.MIN} and ${TICK_BITMAP_INDEX.MAX}`
      );
    }

    const populatedTicks = await this.tickLens.instance.getPopulatedTicksInWord.staticCall(
      params.pool,
      params.tickBitmapIndex
    );

    const result = {
      populatedTicks: populatedTicks.map(
        (tick: { tick: bigint; liquidityNet: bigint; liquidityGross: bigint }) => ({
          tick: Number(tick.tick),
          liquidityNet: tick.liquidityNet,
          liquidityGross: tick.liquidityGross
        })
      )
    };

    return result;
  }
}
