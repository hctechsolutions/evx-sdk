import { ICreatePoolCommandParams } from '@interfaces/commands/params/ICreatePoolCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

@injectable()
@singleton()
export class CreatePoolCommand implements IBaseCommand<ICreatePoolCommandParams, void> {

  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  async execute(params: ICreatePoolCommandParams): Promise<void> {
    try {
      const transaction = await this.factory.instance.createPool(
        params.token0,
        params.token1,
        params.fee,
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
