import { ICancelCommandParams } from '@interfaces/commands/params/ICancelCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Cancel Command
 * @notice Executes a cancel operation on a governance proposal
 * @dev This command interacts with the EvexGovernance contract to cancel a proposal
 */
@injectable()
@singleton()
export class CancelCommand implements IBaseCommand<ICancelCommandParams, void> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the cancel command
   * @param params The parameters for executing the cancel operation
   */
  async execute(params: ICancelCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.cancel(
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
