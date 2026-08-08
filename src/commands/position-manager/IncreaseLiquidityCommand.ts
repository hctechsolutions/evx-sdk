import { IIncreaseLiquidityCommandParams } from '@interfaces/commands/params/IIncreaseLiquidityCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Increase Liquidity Command
 * @notice Increases liquidity for an existing position
 * @dev This command interacts with the PositionManager contract to add liquidity
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class IncreaseLiquidityCommand
  implements IBaseCommand<IIncreaseLiquidityCommandParams, void>
{
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the increase liquidity command
   * @param params The parameters for increasing liquidity
   */
  async execute(params: IIncreaseLiquidityCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.increaseLiquidity({
        tokenId: params.tokenId,
        amount0Desired: params.amount0Desired,
        amount1Desired: params.amount1Desired,
        amount0Min: params.amount0Min,
        amount1Min: params.amount1Min,
        deadline: params.deadline
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
