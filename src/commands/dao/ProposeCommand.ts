import { IProposeCommandParams } from '@interfaces/commands/params/IProposeCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Propose Command
 * @notice Executes a propose operation on a governance proposal
 * @dev This command interacts with the Governance contract to propose a new governance action
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ProposeCommand implements IBaseCommand<IProposeCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the propose command
   * @param params The parameters for executing the propose operation
   */
  async execute(params: IProposeCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.propose(
        params.targets,
        params.values,
        params.calldatas,
        params.description
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
