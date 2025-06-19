import { INameQueryParams } from '@interfaces/queries/params/INameQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Name Query
 * @notice Retrieves the name of the NebularGovernance contract
 * @dev Queries the governance contract to get the contract name
 */
@injectable()
@singleton()
export class NameQuery implements IBaseQuery<INameQueryParams, string> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the contract name
   * @param params The parameters for the query (empty for name function)
   * @returns The contract name as a string
   */
  async execute(_?: INameQueryParams): Promise<string> {
    return await this.governance.instance.name();
  }
}
