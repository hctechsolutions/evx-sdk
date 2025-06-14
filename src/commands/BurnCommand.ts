import { IBurnCommandParams } from '@interfaces/commands/params/IBurnCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

@injectable()
@singleton()
export class BurnCommand implements IBaseCommand<IBurnCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  async execute(params: IBurnCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.burn(params.tokenId);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
} 