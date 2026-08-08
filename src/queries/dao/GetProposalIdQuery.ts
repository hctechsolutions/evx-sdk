import { IGetProposalIdQueryParams } from '@interfaces/queries/params/IGetProposalIdQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Proposal ID Query
 * @notice Retrieves the proposal ID for given proposal parameters
 * @dev Queries the governance contract to calculate the proposal ID from proposal details
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetProposalIdQuery implements IBaseQuery<IGetProposalIdQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal ID
   * @param params The parameters for the query containing proposal details
   * @returns The calculated proposal ID as a bigint
   */
  async execute(params: IGetProposalIdQueryParams): Promise<bigint> {
    return await this.governance.instance.getProposalId(
      params.targets,
      params.values,
      params.calldatas,
      params.descriptionHash
    );
  }
}
