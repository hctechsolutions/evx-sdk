import { IGetQuorumDenominatorQueryParams } from '@interfaces/queries/params/IGetQuorumDenominatorQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Quorum Denominator Query
 * @notice Retrieves the quorum denominator
 * @dev Queries the governance contract to get the denominator used in quorum calculations
 */
@injectable()
@singleton()
export class GetQuorumDenominatorQuery
  implements IBaseQuery<IGetQuorumDenominatorQueryParams, bigint>
{
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the quorum denominator
   * @param params The parameters for the query (empty for this query)
   * @returns The quorum denominator as a bigint
   */
  async execute(_?: IGetQuorumDenominatorQueryParams): Promise<bigint> {
    return await this.governance.instance.quorumDenominator();
  }
}
