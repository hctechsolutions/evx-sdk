import { IIncreaseLiquidityCommandParams } from '@interfaces/commands/params/IIncreaseLiquidityCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Increase Liquidity Command
 * @notice Increases liquidity for an existing position
 * @dev This command interacts with the PositionManager contract to add liquidity
 */
@injectable()
@singleton()
export class IncreaseLiquidityCommand implements IBaseCommand<IIncreaseLiquidityCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the increase liquidity command
   * @param params The parameters for increasing liquidity
   * @param params.tokenId The ID of the position
   * @param params.amount0Desired The desired amount of token0 to add
   * @param params.amount1Desired The desired amount of token1 to add
   * @param params.amount0Min The minimum amount of token0 to add
   * @param params.amount1Min The minimum amount of token1 to add
   * @param params.deadline The deadline for the transaction
   */
  async execute(params: IIncreaseLiquidityCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.increaseLiquidity({
        tokenId: params.tokenId,
        amount0Desired: params.amount0Desired,
        amount1Desired: params.amount1Desired,
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