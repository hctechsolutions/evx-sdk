import { ICastVoteWithReasonAndParamsCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonAndParamsCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Cast Vote With Reason And Params Command
 * @notice Executes a cast vote with reason and params operation on a governance proposal
 * @dev This command interacts with the NebularGovernance contract to cast a vote with reason and additional parameters
 */
@injectable()
@singleton()
export class CastVoteWithReasonAndParamsCommand
  implements IBaseCommand<ICastVoteWithReasonAndParamsCommandParams, void>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly nebularGovernance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote with reason and params command
   * @param params The parameters for executing the cast vote with reason and params operation
   */
  async execute(params: ICastVoteWithReasonAndParamsCommandParams): Promise<void> {
    try {
      const transaction = await this.nebularGovernance.instance.castVoteWithReasonAndParams(
        params.proposalId,
        params.support as number,
        params.reason,
        params.params
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
