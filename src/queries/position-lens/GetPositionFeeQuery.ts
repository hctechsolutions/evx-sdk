import { IGetPositionFeeParams } from '@interfaces/queries/params/IGetPositionFeeParams';
import { IGetPositionFeeOutput } from '@interfaces/queries/outputs/IGetPositionFeeOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PositionLensContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Get Position Fee Query
 * @notice Gets the fees owed for a given position
 * @dev This query interacts with the PositionLensContract to get position fees
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetPositionFeeQuery
  implements IBaseQuery<IGetPositionFeeParams, IGetPositionFeeOutput>
{
  constructor(
    @inject(RPC)
    private readonly rpc: RPC,
    @inject(PositionLensContract)
    private readonly positionLens: PositionLensContract
  ) {}

  /**
   * @notice Executes the get position fee query
   * @param params The parameters for getting the position fees
   * @returns The fees owed for both tokens in the position
   */
  async execute(params: IGetPositionFeeParams): Promise<IGetPositionFeeOutput> {
    const [owed0, owed1] = await this.positionLens.instance.getPositionFee(params.tokenId);

    return {
      owed0,
      owed1
    };
  }
}
