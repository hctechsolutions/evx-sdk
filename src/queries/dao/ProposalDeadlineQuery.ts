import { IProposalDeadlineQueryParams } from '@interfaces/queries/params/IProposalDeadlineQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Proposal Deadline Query
 * @notice Retrieves the deadline for a specific proposal
 * @dev Queries the governance contract to get the deadline timestamp for a proposal
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ProposalDeadlineQuery implements IBaseQuery<IProposalDeadlineQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal deadline
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal deadline as a bigint timestamp
   */
  async execute(params: IProposalDeadlineQueryParams): Promise<bigint> {
    return await this.governance.instance.proposalDeadline(params.proposalId);
  }
}
