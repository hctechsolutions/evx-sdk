import { IEvexTokenQueryParams } from '@interfaces/queries/params/IEvexTokenQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Evex Token Query
 * @notice Retrieves the Evex token address from the EvexGovernance contract
 * @dev Queries the governance contract to get the Evex token address
 */
@injectable()
@singleton()
export class EvexTokenQuery implements IBaseQuery<IEvexTokenQueryParams, string> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the Evex token address
   * @param params The parameters for the query (empty for evexToken function)
   * @returns The Evex token address as a string
   */
  async execute(_?: IEvexTokenQueryParams): Promise<string> {
    return await this.governance.instance.evexToken();
  }
}
