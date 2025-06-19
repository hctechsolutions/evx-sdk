import { IGetProposalVotesQueryParams } from '@interfaces/queries/params/IGetProposalVotesQueryParams';
import { IGetProposalVotesResult } from '@interfaces/queries/IGetProposalVotesResult';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Get Proposal Votes Query
 * @notice Retrieves the votes breakdown for a specific proposal
 * @dev Queries the governance contract to get the votes for, against, and abstain for a proposal
 */
@injectable()
@singleton()
export class GetProposalVotesQuery
  implements IBaseQuery<IGetProposalVotesQueryParams, IGetProposalVotesResult>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal votes
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal votes breakdown as an object
   */
  async execute(params: IGetProposalVotesQueryParams): Promise<IGetProposalVotesResult> {
    const result = await this.governance.instance.proposalVotes(params.proposalId);

    // Assume result is an array or object with keys againstVotes, forVotes, abstainVotes
    // If array: [againstVotes, forVotes, abstainVotes]
    if (Array.isArray(result)) {
      return {
        againstVotes: BigInt(result[0]),
        forVotes: BigInt(result[1]),
        abstainVotes: BigInt(result[2])
      };
    }

    // If object with keys
    return {
      againstVotes: BigInt(result.againstVotes),
      forVotes: BigInt(result.forVotes),
      abstainVotes: BigInt(result.abstainVotes)
    };
  }
}
