import { ICastOverrideVoteBySigCommandParams } from '@interfaces/commands/params/ICastOverrideVoteBySigCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Cast Override Vote By Signature Command
 * @notice Executes a cast override vote by signature operation on a governance proposal
 * @dev This command interacts with the EvexGovernance contract to cast an override vote using a signature
 */
@injectable()
@singleton()
export class CastOverrideVoteBySigCommand
  implements IBaseCommand<ICastOverrideVoteBySigCommandParams, void>
{
  constructor(
    @inject(EvexGovernanceContract)
    private readonly evexGovernance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the cast override vote by signature command
   * @param params The parameters for executing the cast override vote by signature operation
   */
  async execute(params: ICastOverrideVoteBySigCommandParams): Promise<void> {
    try {
      const transaction = await this.evexGovernance.instance.castOverrideVoteBySig(
        params.proposalId,
        params.support as number,
        params.voter,
        params.reason,
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
