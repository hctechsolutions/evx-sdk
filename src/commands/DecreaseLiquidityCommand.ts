import { IDecreaseLiquidityCommandParams } from '@interfaces/commands/params/IDecreaseLiquidityCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

@injectable()
@singleton()
export class DecreaseLiquidityCommand implements IBaseCommand<IDecreaseLiquidityCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

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