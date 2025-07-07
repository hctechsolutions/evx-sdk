import { IGetVotingDelayQueryParams } from '@interfaces/queries/params/IGetVotingDelayQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Get Voting Delay Query
 * @notice Retrieves the voting delay
 * @dev Queries the governance contract to get the delay between proposal creation and voting start
 */
@injectable()
@singleton()
export class GetVotingDelayQuery implements IBaseQuery<IGetVotingDelayQueryParams, bigint> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the voting delay
   * @param params The parameters for the query (empty for this query)
   * @returns The voting delay as a bigint
   */
  async execute(_?: IGetVotingDelayQueryParams): Promise<bigint> {
    return await this.governance.instance.votingDelay();
  }
}
