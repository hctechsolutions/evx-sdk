import { IGetQuorumDenominatorQueryParams } from '@interfaces/queries/params/IGetQuorumDenominatorQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

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
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the quorum denominator
   * @param params The parameters for the query (empty for this query)
   * @returns The quorum denominator as a bigint
   */
  async execute(params: IGetQuorumDenominatorQueryParams): Promise<bigint> {
    return await this.governance.instance.quorumDenominator();
  }
} 