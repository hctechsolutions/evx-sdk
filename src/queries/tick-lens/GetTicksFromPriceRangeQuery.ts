import { IGetTicksFromPriceRangeQueryParams } from '@interfaces/queries/params/IGetTicksFromPriceRangeQueryParams';
import { IGetTicksFromPriceRangeOutput } from '@interfaces/queries/outputs/IGetTicksFromPriceRangeOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { TickLensContract } from '@contracts';

/**
 * @title Get Ticks From Price Range Query
 * @notice Gets the tick lower and tick upper values from a price range
 * @dev This query interacts with the TickLensContract to convert sqrt prices to ticks
 */
@injectable()
@singleton()
export class GetTicksFromPriceRangeQuery
  implements IBaseQuery<IGetTicksFromPriceRangeQueryParams, IGetTicksFromPriceRangeOutput>
{
  constructor(
    @inject(TickLensContract)
    private readonly tickLens: TickLensContract
  ) {}

  /**
   * @notice Executes the get ticks from price range query
   * @param params The parameters for getting the ticks from price range
   * @returns The tick lower and tick upper values
   * @throws Error if sqrtPriceLowerX96 is greater than or equal to sqrtPriceUpperX96
   */
  async execute(
    params: IGetTicksFromPriceRangeQueryParams
  ): Promise<IGetTicksFromPriceRangeOutput> {
    if (params.sqrtPriceLowerX96 <= 0n || params.sqrtPriceUpperX96 <= 0n) {
      throw new Error('sqrtPriceLowerX96 and sqrtPriceUpperX96 must be positive');
    }

    if (params.sqrtPriceLowerX96 >= params.sqrtPriceUpperX96) {
      throw new Error('sqrtPriceLowerX96 must be less than sqrtPriceUpperX96');
    }

    const [tickLower, tickUpper] = await this.tickLens.instance.getTicksFromPriceRange.staticCall(
      params.pool,
      params.sqrtPriceLowerX96,
      params.sqrtPriceUpperX96
    );

    return {
      tickLower: Number(tickLower),
      tickUpper: Number(tickUpper)
    };
  }
}
