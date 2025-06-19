import { IProposeCommandParams } from '@interfaces/commands/params/IProposeCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Propose Command
 * @notice Executes a propose operation on a governance proposal
 * @dev This command interacts with the NebularGovernance contract to propose a new governance action
 */
@injectable()
@singleton()
export class ProposeCommand implements IBaseCommand<IProposeCommandParams, void> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly nebularGovernance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the propose command
   * @param params The parameters for executing the propose operation
   */
  async execute(params: IProposeCommandParams): Promise<void> {
    try {
      const transaction = await this.nebularGovernance.instance.propose(
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
