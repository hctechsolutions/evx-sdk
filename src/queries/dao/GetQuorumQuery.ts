import { IGetQuorumQueryParams } from '@interfaces/queries/params/IGetQuorumQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Get Quorum Query
 * @notice Retrieves the quorum for a specific block number
 * @dev Queries the governance contract to get the minimum voting power required for a proposal to pass
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetQuorumQuery implements IBaseQuery<IGetQuorumQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the quorum for a specific block number
   * @param params The parameters for the query containing block number
   * @returns The quorum value as a bigint
   */
  async execute(params: IGetQuorumQueryParams): Promise<bigint> {
    return await this.governance.instance.quorum(params.blockNumber);
  }
}
