import { IInitializeOnlyPoolCommandParams } from '@interfaces/commands/params/IInitializePoolCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Initialize Pool Command
 * @notice Initializes a pool with the given price
 * @dev This command interacts with the PoolContract to initialize the pool
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class InitializePoolCommand
  implements IBaseCommand<IInitializeOnlyPoolCommandParams, void>
{
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes the initialize pool command
   * @param params The parameters for initializing the pool
   */
  async execute(params: IInitializeOnlyPoolCommandParams): Promise<void> {
    const pool = new PoolContract(params.poolAddress, this.rpc);
    await pool.setSigner(params.signer);

    try {
      const transaction = await pool.instance.initializeObservation(
        params.initialPrice
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
