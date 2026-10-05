import { ISetDynamicFeeCommandParams } from '@interfaces/commands/params/ISetDynamicFeeCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';
import { PoolContract } from '@contracts';
import { RPC } from '@providers';

/**
 * @title Set Dynamic Fee Command
 * @notice Updates the swap fee on an EvxPool via setDynamicFee (policyKeeper ACL)
 * @dev Uses ABI synced from Foundry artifacts
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class SetDynamicFeeCommand
  implements IBaseCommand<ISetDynamicFeeCommandParams, void>
{
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  /**
   * @notice Executes setDynamicFee on the target pool
   * @param params Pool address, new fee, signer, and lifecycle callbacks
   */
  async execute(params: ISetDynamicFeeCommandParams): Promise<void> {
    const pool = new PoolContract(params.poolAddress, this.rpc);
    await pool.setSigner(params.signer);

    try {
      const transaction = await pool.instance.setDynamicFee(params.newFee);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      if (!receipt) {
        params.onFail?.(new Error('setDynamicFee: null transaction receipt'));
        return;
      }

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
