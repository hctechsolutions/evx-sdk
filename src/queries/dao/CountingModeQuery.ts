import { ICountingModeQueryParams } from '@interfaces/queries/params/ICountingModeQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Counting Mode Query
 * @notice Retrieves the counting mode of the governance contract
 * @dev Queries the governance contract to get the counting mode (e.g., "=bravo&from=default")
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class CountingModeQuery implements IBaseQuery<ICountingModeQueryParams, string> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the counting mode
   * @param params The parameters for the query (empty for COUNTING_MODE function)
   * @returns The counting mode as a string
   */
  async execute(_?: ICountingModeQueryParams): Promise<string> {
    return await this.governance.instance.COUNTING_MODE();
  }
}
