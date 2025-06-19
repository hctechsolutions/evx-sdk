import { ICancelCommandParams } from '@interfaces/commands/params/ICancelCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Cancel Command
 * @notice Executes a cancel operation on a governance proposal
 * @dev This command interacts with the NebularGovernance contract to cancel a proposal
 */
@injectable()
@singleton()
export class CancelCommand implements IBaseCommand<ICancelCommandParams, void> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly nebularGovernance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the cancel command
   * @param params The parameters for executing the cancel operation
   */
  async execute(params: ICancelCommandParams): Promise<void> {
    try {
      const transaction = await this.nebularGovernance.instance.cancel(
        params.targets,
        params.values,
        params.calldatas,
        params.descriptionHash
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
