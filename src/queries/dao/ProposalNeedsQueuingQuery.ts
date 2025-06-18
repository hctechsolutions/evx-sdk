import { IProposalNeedsQueuingQueryParams } from '@interfaces/queries/params/IProposalNeedsQueuingQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Proposal Needs Queuing Query
 * @notice Checks if a specific proposal needs queuing
 * @dev Queries the governance contract to check if a proposal requires queuing before execution
 */
@injectable()
@singleton()
export class ProposalNeedsQueuingQuery
  implements IBaseQuery<IProposalNeedsQueuingQueryParams, boolean>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to check if a proposal needs queuing
   * @param params The parameters for the query containing proposal ID
   * @returns True if the proposal needs queuing, false otherwise
   */
  async execute(params: IProposalNeedsQueuingQueryParams): Promise<boolean> {
    return await this.governance.instance.proposalNeedsQueuing(
      params.proposalId
    );
  }
} 