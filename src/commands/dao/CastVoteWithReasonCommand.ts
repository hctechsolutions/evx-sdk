import { ICastVoteWithReasonCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Cast Vote With Reason Command
 * @notice Executes a cast vote with reason operation on a governance proposal
 * @dev This command interacts with the Governance contract to cast a vote with a reason
 */
@injectable()
@singleton()
export class CastVoteWithReasonCommand
  implements IBaseCommand<ICastVoteWithReasonCommandParams, void>
{
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote with reason command
   * @param params The parameters for executing the cast vote with reason operation
   */
  async execute(params: ICastVoteWithReasonCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.castVoteWithReason(
        params.proposalId,
        params.support as number,
        params.reason
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
