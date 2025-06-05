import { ICreateAndInitializePoolCommandParams } from '@interfaces/commands/params/ICreateAndInitializePoolCommandParams';
import { ICreatePoolCommandOutput } from '@interfaces/commands/outputs/ICreatePoolCommandOutput';
import { PositionManagerContract } from '@contracts/PositionManagerContract';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { sortTokens } from '@utils/tokens';

@injectable()
@singleton()
export class CreateAndInitializePoolCommand implements
  IBaseCommand<ICreateAndInitializePoolCommandParams, ICreatePoolCommandOutput> {

  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  async execute(params: ICreateAndInitializePoolCommandParams): Promise<ICreatePoolCommandOutput> {

    const orderedTokens = sortTokens({
      token0: params.token0,
      token1: params.token1
    });

    params.token0 = orderedTokens.token0;
    params.token1 = orderedTokens.token1;

    try {
      const pool = await this.positionManager.instance.createAndInitializePoolIfNecessary.staticCall(
        params.token0,
        params.token1,
        params.fee,
        params.initialPrice
      );

      const transaction = await this.positionManager.instance.createAndInitializePoolIfNecessary(
        params.token0,
        params.token1,
        params.fee,
        params.initialPrice
      );

      params.onTransaction?.(transaction.hash);
      await transaction.wait();

      const output: ICreatePoolCommandOutput = {
        pool: pool
      }

      params.onDone?.(output);
      return output;
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }
}
