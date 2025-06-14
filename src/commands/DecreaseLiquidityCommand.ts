import { IDecreaseLiquidityCommandParams } from '@interfaces/commands/params/IDecreaseLiquidityCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Decrease Liquidity Command
 * @notice Decreases liquidity from a position
 * @dev This command interacts with the PositionManager contract to decrease liquidity
 */
@injectable()
@singleton()
export class DecreaseLiquidityCommand implements IBaseCommand<IDecreaseLiquidityCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the decrease liquidity command
   * @param params The parameters for decreasing liquidity
   * @param params.tokenId The ID of the position
   * @param params.liquidity The amount of liquidity to remove
   * @param params.amount0Min The minimum amount of token0 to receive
   * @param params.amount1Min The minimum amount of token1 to receive
   * @param params.deadline The deadline for the transaction
   */
  async execute(params: IDecreaseLiquidityCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.decreaseLiquidity({
        tokenId: params.tokenId,
        liquidity: params.liquidity,
        amount0Min: params.amount0Min,
        amount1Min: params.amount1Min,
        deadline: params.deadline,
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
} 