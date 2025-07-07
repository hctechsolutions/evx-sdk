import { ICastOverrideVoteCommandParams } from '@interfaces/commands/params/ICastOverrideVoteCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Cast Override Vote Command
 * @notice Executes a cast override vote operation on a governance proposal
 * @dev This command interacts with the EvexGovernance contract to cast an override vote
 */
@injectable()
@singleton()
export class CastOverrideVoteCommand implements IBaseCommand<ICastOverrideVoteCommandParams, void> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the cast override vote command
   * @param params The parameters for executing the cast override vote operation
   */
  async execute(params: ICastOverrideVoteCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.castOverrideVote(
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
