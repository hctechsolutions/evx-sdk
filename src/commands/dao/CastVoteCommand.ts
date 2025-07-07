import { ICastVoteCommandParams } from '@interfaces/commands/params/ICastVoteCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Cast Vote Command
 * @notice Executes a cast vote operation on a governance proposal
 * @dev This command interacts with the EvexGovernance contract to cast a vote
 */
@injectable()
@singleton()
export class CastVoteCommand implements IBaseCommand<ICastVoteCommandParams, void> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote command
   * @param params The parameters for executing the cast vote operation
   */
  async execute(params: ICastVoteCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.castVote(
        params.proposalId,
        params.support as number
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
