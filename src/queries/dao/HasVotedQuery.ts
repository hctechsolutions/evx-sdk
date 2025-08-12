import { IHasVotedQueryParams } from '@interfaces/queries/params/IHasVotedQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvxGovernanceContract } from '@contracts';

/**
 * @title Has Voted Query
 * @notice Checks if a specific account has voted on a given proposal
 * @dev Queries the governance contract to check the voting status of an account for a specific proposal
 */
@injectable()
@singleton()
export class HasVotedQuery implements IBaseQuery<IHasVotedQueryParams, boolean> {
  constructor(
    @inject(EvxGovernanceContract)
    private readonly governance: EvxGovernanceContract
  ) {}

  /**
   * @notice Executes the query to check if an account has voted
   * @param params The parameters for the query containing proposal ID and account address
   * @returns True if the account has voted, false otherwise
   */
  async execute(params: IHasVotedQueryParams): Promise<boolean> {
    return await this.governance.instance.hasVoted(params.proposalId, params.account);
  }
}
