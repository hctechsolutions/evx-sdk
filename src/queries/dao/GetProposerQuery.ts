import { IGetProposerQueryParams } from '@interfaces/queries/params/IGetProposerQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Get Proposer Query
 * @notice Retrieves the proposer address for a specific proposal
 * @dev Queries the governance contract to get the proposer address for a proposal
 */
@injectable()
@singleton()
export class GetProposerQuery
  implements IBaseQuery<IGetProposerQueryParams, string>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposer address
   * @param params The parameters for the query containing proposal ID
   * @returns The proposer address as a string
   */
  async execute(params: IGetProposerQueryParams): Promise<string> {
    return await this.governance.instance.proposalProposer(
      params.proposalId
    );
  }
} 