import { IMintCommandParams } from '@interfaces/commands/params/IMintCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

@injectable()
@singleton()
export class MintCommand implements IBaseCommand<IMintCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  async execute(params: IMintCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.mint({
        token0: params.token0,
        token1: params.token1,
        fee: params.fee,
        tickLower: params.tickLower,
        tickUpper: params.tickUpper,
        amount0Desired: params.amount0Desired,
        amount1Desired: params.amount1Desired,
        amount0Min: params.amount0Min,
        amount1Min: params.amount1Min,
        recipient: params.recipient,
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