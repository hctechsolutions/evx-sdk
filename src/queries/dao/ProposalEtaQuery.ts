import { IProposalEtaQueryParams } from '@interfaces/queries/params/IProposalEtaQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Proposal Eta Query
 * @notice Retrieves the eta for a specific proposal
 * @dev Queries the governance contract to get the eta timestamp for a proposal
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ProposalEtaQuery implements IBaseQuery<IProposalEtaQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal eta
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal eta as a bigint timestamp
   */
  async execute(params: IProposalEtaQueryParams): Promise<bigint> {
    return await this.governance.instance.proposalEta(params.proposalId);
  }
}
