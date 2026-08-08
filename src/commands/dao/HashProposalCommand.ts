import { IHashProposalCommandParams } from '@interfaces/commands/params/IHashProposalCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Hash Proposal Command
 * @notice Executes a hash proposal operation to calculate the proposal ID
 * @dev This command interacts with the Governance contract to hash proposal parameters
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class HashProposalCommand implements IBaseCommand<IHashProposalCommandParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the hash proposal command
   * @param params The parameters for executing the hash proposal operation
   * @returns The calculated proposal ID as a bigint
   */
  async execute(params: IHashProposalCommandParams): Promise<bigint> {
    try {
      const proposalId = await this.governance.instance.hashProposal(
        params.targets,
        params.values,
        params.calldatas,
        params.descriptionHash
      );

      params.onDone?.(proposalId);
      return proposalId;
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }
}
