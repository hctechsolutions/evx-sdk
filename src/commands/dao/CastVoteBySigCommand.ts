import { ICastVoteBySigCommandParams } from '@interfaces/commands/params/ICastVoteBySigCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Cast Vote By Sig Command
 * @notice Executes a cast vote by signature operation on a governance proposal
 * @dev This command interacts with the Governance contract to cast a vote by signature
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class CastVoteBySigCommand implements IBaseCommand<ICastVoteBySigCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the cast vote by sig command
   * @param params The parameters for executing the cast vote by sig operation
   */
  async execute(params: ICastVoteBySigCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.castVoteBySig(
        params.proposalId,
        params.support as number,
        params.voter,
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
