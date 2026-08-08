import { IClockModeQueryParams } from '@interfaces/queries/params/IClockModeQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Clock Mode Query
 * @notice Retrieves the clock mode of the governance contract
 * @dev Queries the governance contract to get the clock mode (e.g., "mode=blocknumber&from=default")
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class ClockModeQuery implements IBaseQuery<IClockModeQueryParams, string> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the clock mode
   * @param params The parameters for the query (empty for CLOCK_MODE function)
   * @returns The clock mode as a string
   */
  async execute(_?: IClockModeQueryParams): Promise<string> {
    return await this.governance.instance.CLOCK_MODE();
  }
}
