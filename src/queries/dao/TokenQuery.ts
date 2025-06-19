import { ITokenQueryParams } from '@interfaces/queries/params/ITokenQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Token Query
 * @notice Retrieves the token address from the governance contract
 * @dev Queries the governance contract to get the governance token address
 */
@injectable()
@singleton()
export class TokenQuery implements IBaseQuery<ITokenQueryParams, string> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the token address
   * @param params The parameters for the query (empty for token function)
   * @returns The token address as a string
   */
  async execute(_?: ITokenQueryParams): Promise<string> {
    return await this.governance.instance.token();
  }
}
