import { ICreateAndInitializePoolCommandParams } from '@interfaces/commands/ICreateAndInitializePoolCommandParams';
import { NonfungiblePositionManagerContract } from '@contracts/NonfungiblePositionManagerContract';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, registry, inject } from 'tsyringe';

@injectable()
@registry([{ token: CreateAndInitializePoolCommand, useClass: CreateAndInitializePoolCommand }])
export class CreateAndInitializePoolCommand implements IBaseCommand<ICreateAndInitializePoolCommandParams, void> {

  constructor(
    @inject(NonfungiblePositionManagerContract)
    private readonly positionManager: NonfungiblePositionManagerContract
  ) {}

  async execute(params: ICreateAndInitializePoolCommandParams): Promise<void> {

  }
}
