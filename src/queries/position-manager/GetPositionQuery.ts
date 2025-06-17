import { IGetPositionParams } from '@interfaces/queries/params/IGetPositionParams';
import { IGetPositionOutput } from '@interfaces/queries/outputs/IGetPositionOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Get Position Query
 * @notice Gets the position data for a given tokenId
 * @dev This query interacts with the PositionManagerContract to get position data
 */
@injectable()
@singleton()
export class GetPositionQuery implements IBaseQuery<IGetPositionParams, IGetPositionOutput> {
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the get position query
   * @param params The parameters for getting the position
   * @returns The position data
   */
  async execute(params: IGetPositionParams): Promise<IGetPositionOutput> {
    const positionManager = new PositionManagerContract(this.rpc);

    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1
    ] = await positionManager.instance.positions(params.tokenId);

    return {
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1
    };
  }
}
