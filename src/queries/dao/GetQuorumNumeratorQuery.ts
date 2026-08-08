import { IGetQuorumNumeratorQueryParams } from '@interfaces/queries/params/IGetQuorumNumeratorQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Quorum Numerator Query
 * @notice Retrieves the quorum numerator for a specific timepoint or current
 * @dev Queries the governance contract to get the numerator used in quorum calculations
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetQuorumNumeratorQuery implements IBaseQuery<IGetQuorumNumeratorQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the quorum numerator
   * @param params The parameters for the query containing optional timepoint
   * @returns The quorum numerator as a bigint
   */
  async execute(params: IGetQuorumNumeratorQueryParams): Promise<bigint> {
    if (params.timepoint !== undefined) {
      return await this.governance.instance.quorumNumerator(params.timepoint);
    } else {
      return await this.governance.instance.quorumNumerator();
    }
  }
}
