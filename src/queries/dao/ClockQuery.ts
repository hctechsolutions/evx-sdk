import { IClockQueryParams } from '@interfaces/queries/params/IClockQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Clock Query
 * @notice Retrieves the current clock value from the Governance contract
 * @dev Queries the governance contract to get the current timepoint/clock value
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ClockQuery implements IBaseQuery<IClockQueryParams, bigint> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the current clock value
   * @param params The parameters for the query (empty for clock function)
   * @returns The current clock value as a bigint
   */
  async execute(_?: IClockQueryParams): Promise<bigint> {
    return await this.governance.instance.clock();
  }
}
