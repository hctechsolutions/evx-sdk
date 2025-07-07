import { IGetQuorumQueryParams } from '@interfaces/queries/params/IGetQuorumQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Get Quorum Query
 * @notice Retrieves the quorum for a specific block number
 * @dev Queries the governance contract to get the minimum voting power required for a proposal to pass
 */
@injectable()
@singleton()
export class GetQuorumQuery implements IBaseQuery<IGetQuorumQueryParams, bigint> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
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
