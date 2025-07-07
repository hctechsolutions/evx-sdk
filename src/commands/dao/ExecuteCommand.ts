import { IExecuteCommandParams } from '@interfaces/commands/params/IExecuteCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Execute Command
 * @notice Executes a governance proposal
 * @dev This command interacts with the EvexGovernance contract to execute a proposal
 */
@injectable()
@singleton()
export class ExecuteCommand implements IBaseCommand<IExecuteCommandParams, void> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the execute command
   * @param params The parameters for executing the governance proposal
   */
  async execute(params: IExecuteCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.execute(
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
