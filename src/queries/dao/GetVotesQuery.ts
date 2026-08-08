import { IGetVotesQueryParams } from '@interfaces/queries/params/IGetVotesQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Votes Query
 * @notice Retrieves the voting power for a given account at a specific block number
 * @dev Queries the governance contract to get the voting power of an account at a historical block
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetVotesQuery implements IBaseQuery<IGetVotesQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the voting power
   * @param params The parameters for the query containing account address and block number
   * @returns The voting power as a bigint
   */
  async execute(params: IGetVotesQueryParams): Promise<bigint> {
    return await this.governance.instance.getVotes(params.account, params.blockNumber);
  }
}
