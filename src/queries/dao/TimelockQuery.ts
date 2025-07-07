import { ITimelockQueryParams } from '@interfaces/queries/params/ITimelockQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Timelock Query
 * @notice Retrieves the timelock address from the governance contract
 * @dev Queries the governance contract to get the timelock controller address
 */
@injectable()
@singleton()
export class TimelockQuery implements IBaseQuery<ITimelockQueryParams, string> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the timelock address
   * @param params The parameters for the query (empty for timelock function)
   * @returns The timelock address as a string
   */
  async execute(_?: ITimelockQueryParams): Promise<string> {
    return await this.governance.instance.timelock();
  }
}
