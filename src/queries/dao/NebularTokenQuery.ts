import { INebularTokenQueryParams } from '@interfaces/queries/params/INebularTokenQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Nebular Token Query
 * @notice Retrieves the Nebular token address from the NebularGovernance contract
 * @dev Queries the governance contract to get the Nebular token address
 */
@injectable()
@singleton()
export class NebularTokenQuery implements IBaseQuery<INebularTokenQueryParams, string> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the Nebular token address
   * @param params The parameters for the query (empty for nebularToken function)
   * @returns The Nebular token address as a string
   */
  async execute(_?: INebularTokenQueryParams): Promise<string> {
    return await this.governance.instance.nebularToken();
  }
}
