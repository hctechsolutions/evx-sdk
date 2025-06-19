import { IUpdateQuorumNumeratorCommandParams } from '@interfaces/commands/params/IUpdateQuorumNumeratorCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Update Quorum Numerator Command
 * @notice Executes an update quorum numerator operation in governance
 * @dev This command interacts with the NebularGovernance contract to update the quorum numerator
 */
@injectable()
@singleton()
export class UpdateQuorumNumeratorCommand
  implements IBaseCommand<IUpdateQuorumNumeratorCommandParams, void>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly nebularGovernance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the update quorum numerator command
   * @param params The parameters for executing the update quorum numerator operation
   */
  async execute(params: IUpdateQuorumNumeratorCommandParams): Promise<void> {
    try {
      const transaction = await this.nebularGovernance.instance.updateQuorumNumerator(
        params.newQuorumNumerator
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
