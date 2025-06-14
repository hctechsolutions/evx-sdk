import { IGetFeeAmountTickSpacingQueryParams } from '@interfaces/queries/params/IGetFeeAmountTickSpacingQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

/**
 * @title Get Fee Amount Tick Spacing Query
 * @notice Retrieves the tick spacing for a given fee amount
 * @dev Queries the factory contract to get the tick spacing configuration
 */
@injectable()
@singleton()
export class GetFeeAmountTickSpacingQuery implements IBaseQuery<IGetFeeAmountTickSpacingQueryParams, number> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  /**
   * @notice Executes the query to get tick spacing
   * @param params The parameters for the query
   * @returns The tick spacing for the given fee amount
   */
  async execute(params: IGetFeeAmountTickSpacingQueryParams): Promise<number> {
    return await this.factory.instance.feeAmountTickSpacing(params.fee);
  }
} 