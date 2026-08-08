import { IDecreaseLiquidityCommandParams } from '@interfaces/commands/params/IDecreaseLiquidityCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Decrease Liquidity Command
 * @notice Decreases liquidity from a position
 * @dev This command interacts with the PositionManager contract to decrease liquidity
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class DecreaseLiquidityCommand
  implements IBaseCommand<IDecreaseLiquidityCommandParams, void>
{
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the decrease liquidity command
   * @param params The parameters for decreasing liquidity
   */
  async execute(params: IDecreaseLiquidityCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.decreaseLiquidity({
        tokenId: params.tokenId,
        liquidity: params.liquidity,
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
