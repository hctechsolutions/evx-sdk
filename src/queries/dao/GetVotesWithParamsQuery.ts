import { IGetVotesWithParamsQueryParams } from '@interfaces/queries/params/IGetVotesWithParamsQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Get Votes With Params Query
 * @notice Retrieves the voting power for a given account at a specific timepoint with additional parameters
 * @dev Queries the governance contract to get the voting power of an account at a historical timepoint with custom parameters
 */
@injectable()
@singleton()
export class GetVotesWithParamsQuery implements IBaseQuery<IGetVotesWithParamsQueryParams, bigint> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the voting power with parameters
   * @param params The parameters for the query containing account address, timepoint and additional params
   * @returns The voting power as a bigint
   */
  async execute(params: IGetVotesWithParamsQueryParams): Promise<bigint> {
    return await this.governance.instance.getVotesWithParams(
      params.account,
      params.timepoint,
      params.params
    );
  }
}
