import { IClockModeQueryParams } from '@interfaces/queries/params/IClockModeQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Clock Mode Query
 * @notice Retrieves the clock mode of the governance contract
 * @dev Queries the governance contract to get the clock mode (e.g., "mode=blocknumber&from=default")
 */
@injectable()
@singleton()
export class ClockModeQuery implements IBaseQuery<IClockModeQueryParams, string> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
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
