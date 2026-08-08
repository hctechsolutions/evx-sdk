import { IGetProposerQueryParams } from '@interfaces/queries/params/IGetProposerQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Proposer Query
 * @notice Retrieves the proposer address for a specific proposal
 * @dev Queries the governance contract to get the proposer address for a proposal
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetProposerQuery implements IBaseQuery<IGetProposerQueryParams, string> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposer address
   * @param params The parameters for the query containing proposal ID
   * @returns The proposer address as a string
   */
  async execute(params: IGetProposerQueryParams): Promise<string> {
    return await this.governance.instance.proposalProposer(params.proposalId);
  }
}
