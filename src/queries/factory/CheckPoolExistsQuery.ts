import { ICheckPoolExistsQueryParams } from '@interfaces/queries/params/ICheckPoolExistsQueryParams';
import { ICheckPoolExistsOutput } from '@interfaces/queries/outputs/ICheckPoolExistsOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

/**
 * @title Check Pool Exists Query
 * @notice Checks if a pool exists for the given token pair and fee tier
 * @dev Queries the factory contract to get the pool address and determines existence
 */
@injectable()
@singleton()
export class CheckPoolExistsQuery
  implements IBaseQuery<ICheckPoolExistsQueryParams, ICheckPoolExistsOutput>
{
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  /**
   * @notice Executes the query to check if a pool exists
   * @param params The parameters for checking pool existence
   * @returns Pool existence status and address
   */
  async execute(params: ICheckPoolExistsQueryParams): Promise<ICheckPoolExistsOutput> {
    // Get the pool address from the factory
    const poolAddress = await this.factory.instance.getPool.staticCall(
      params.token0,
      params.token1,
      params.fee
    );

    const exists = poolAddress !== '0x0000000000000000000000000000000000000000';

    return {
      exists,
      poolAddress
    };
  }
}
