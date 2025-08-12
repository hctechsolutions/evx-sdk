import { ICastVoteCommandParams } from '@interfaces/commands/params/ICastVoteCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Cast Vote Command
 * @notice Executes a cast vote operation on a governance proposal
 * @dev This command interacts with the Governance contract to cast a vote
 */
@injectable()
@singleton()
export class CastVoteCommand implements IBaseCommand<ICastVoteCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote command
   * @param params The parameters for executing the cast vote operation
   */
  async execute(params: ICastVoteCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.castVote(
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
