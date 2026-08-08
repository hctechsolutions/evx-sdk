import { IExecuteCommandParams } from '@interfaces/commands/params/IExecuteCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Execute Command
 * @notice Executes a governance proposal
 * @dev This command interacts with the Governance contract to execute a proposal
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ExecuteCommand implements IBaseCommand<IExecuteCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the execute command
   * @param params The parameters for executing the governance proposal
   */
  async execute(params: IExecuteCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.execute(
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
