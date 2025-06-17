import { ICreatePoolCommandParams } from '@interfaces/commands/params/ICreatePoolCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

/**
 * @title Create Pool Command
 * @notice Creates a new pool with the given tokens and fee
 * @dev This command interacts with the Factory contract to create a pool
 */
@injectable()
@singleton()
export class CreatePoolCommand implements IBaseCommand<ICreatePoolCommandParams, void> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  /**
   * @notice Executes the create pool command
   * @param params The parameters for creating the pool
   */
  async execute(params: ICreatePoolCommandParams): Promise<void> {
    try {
      const transaction = await this.factory.instance.createPool(
        params.token0,
        params.token1,
        params.fee
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
