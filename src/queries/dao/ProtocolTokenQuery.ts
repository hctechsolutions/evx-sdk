import { IProtocolTokenQueryParams } from '@interfaces/queries/params/IProtocolTokenQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Evx Token Query
 * @notice Retrieves the Evx token address from the Governance contract
 * @dev Queries the governance contract to get the Evx token address
 */
@injectable()
@singleton()
export class ProtocolTokenQuery implements IBaseQuery<IProtocolTokenQueryParams, string> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the Evx token address
   * @param params The parameters for the query (empty for evxToken function)
   * @returns The Evx token address as a string
   */
  async execute(_?: IProtocolTokenQueryParams): Promise<string> {
    return await this.governance.instance.evxToken();
  }
}
