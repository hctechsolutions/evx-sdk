import { IVersionQueryParams } from '@interfaces/queries/params/IVersionQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Version Query
 * @notice Retrieves the version of the EvexGovernance contract
 * @dev Queries the governance contract to get the contract version
 */
@injectable()
@singleton()
export class VersionQuery implements IBaseQuery<IVersionQueryParams, string> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the contract version
   * @param params The parameters for the query (empty for version function)
   * @returns The contract version as a string
   */
  async execute(_?: IVersionQueryParams): Promise<string> {
    return await this.governance.instance.version();
  }
}
