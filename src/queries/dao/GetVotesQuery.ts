import { IGetVotesQueryParams } from '@interfaces/queries/params/IGetVotesQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Get Votes Query
 * @notice Retrieves the voting power for a given account at a specific block number
 * @dev Queries the governance contract to get the voting power of an account at a historical block
 */
@injectable()
@singleton()
export class GetVotesQuery implements IBaseQuery<IGetVotesQueryParams, bigint> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
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
