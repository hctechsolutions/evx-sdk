import { IProposalThresholdQueryParams } from '@interfaces/queries/params/IProposalThresholdQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Proposal Threshold Query
 * @notice Retrieves the proposal threshold
 * @dev Queries the governance contract to get the minimum voting power required to create a proposal
 */
@injectable()
@singleton()
export class ProposalThresholdQuery implements IBaseQuery<IProposalThresholdQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal threshold
   * @param params The parameters for the query (empty for this query)
   * @returns The proposal threshold as a bigint
   */
  async execute(_?: IProposalThresholdQueryParams): Promise<bigint> {
    return await this.governance.instance.proposalThreshold();
  }
}
