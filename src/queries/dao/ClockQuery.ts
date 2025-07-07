import { IClockQueryParams } from '@interfaces/queries/params/IClockQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Clock Query
 * @notice Retrieves the current clock value from the EvexGovernance contract
 * @dev Queries the governance contract to get the current timepoint/clock value
 */
@injectable()
@singleton()
export class ClockQuery implements IBaseQuery<IClockQueryParams, bigint> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
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
