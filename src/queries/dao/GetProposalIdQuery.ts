import { IGetProposalIdQueryParams } from '@interfaces/queries/params/IGetProposalIdQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Get Proposal ID Query
 * @notice Retrieves the proposal ID for given proposal parameters
 * @dev Queries the governance contract to calculate the proposal ID from proposal details
 */
@injectable()
@singleton()
export class GetProposalIdQuery
  implements IBaseQuery<IGetProposalIdQueryParams, bigint>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
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