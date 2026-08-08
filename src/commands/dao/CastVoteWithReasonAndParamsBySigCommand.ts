import { ICastVoteWithReasonAndParamsBySigCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonAndParamsBySigCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Cast Vote With Reason And Params By Sig Command
 * @notice Executes a cast vote with reason and params by signature operation on a governance proposal
 * @dev This command interacts with the Governance contract to cast a vote with reason and additional parameters by signature
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class CastVoteWithReasonAndParamsBySigCommand
  implements IBaseCommand<ICastVoteWithReasonAndParamsBySigCommandParams, void>
{
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote with reason and params by sig command
   * @param params The parameters for executing the cast vote with reason and params by sig operation
   */
  async execute(params: ICastVoteWithReasonAndParamsBySigCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.castVoteWithReasonAndParamsBySig(
        params.proposalId,
        params.support as number,
        params.voter,
        params.reason,
        params.params,
        params.signature
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
