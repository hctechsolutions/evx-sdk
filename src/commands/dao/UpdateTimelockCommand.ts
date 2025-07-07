import { IUpdateTimelockCommandParams } from '@interfaces/commands/params/IUpdateTimelockCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Update Timelock Command
 * @notice Executes an update timelock operation in governance
 * @dev This command interacts with the EvexGovernance contract to update the timelock address
 */
@injectable()
@singleton()
export class UpdateTimelockCommand implements IBaseCommand<IUpdateTimelockCommandParams, void> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the update timelock command
   * @param params The parameters for executing the update timelock operation
   */
  async execute(params: IUpdateTimelockCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.updateTimelock(params.newTimelock);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
