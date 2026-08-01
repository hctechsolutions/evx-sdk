import { ISetDynamicFeeCommandParams } from '@interfaces/commands/params/ISetDynamicFeeCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, singleton } from 'tsyringe';
import { PoolContract } from '@contracts';

/**
 * @title Set Dynamic Fee Command
 * @notice Updates the swap fee on an EvxPool via setDynamicFee (policyKeeper ACL)
 * @dev Uses ABI synced from Foundry artifacts (AD-6)
 */
@injectable()
@singleton()
export class SetDynamicFeeCommand implements IBaseCommand<ISetDynamicFeeCommandParams, void> {
  /**
   * @notice Executes setDynamicFee on the target pool
   * @param params Pool address, new fee, signer, and lifecycle callbacks
   */
  async execute(params: ISetDynamicFeeCommandParams): Promise<void> {
    const pool = new PoolContract(params.poolAddress);
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
