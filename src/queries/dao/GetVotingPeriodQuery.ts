import { IGetVotingPeriodQueryParams } from '@interfaces/queries/params/IGetVotingPeriodQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Voting Period Query
 * @notice Retrieves the voting period
 * @dev Queries the governance contract to get the duration of the voting period
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetVotingPeriodQuery implements IBaseQuery<IGetVotingPeriodQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the voting period
   * @param params The parameters for the query (empty for this query)
   * @returns The voting period as a bigint
   */
  async execute(_?: IGetVotingPeriodQueryParams): Promise<bigint> {
    return await this.governance.instance.votingPeriod();
  }
}
