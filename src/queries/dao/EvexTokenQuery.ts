import { IEvxTokenQueryParams } from '@interfaces/queries/params/IEvxTokenQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvxGovernanceContract } from '@contracts';

/**
 * @title Evx Token Query
 * @notice Retrieves the Evx token address from the EvxGovernance contract
 * @dev Queries the governance contract to get the Evx token address
 */
@injectable()
@singleton()
export class EvxTokenQuery implements IBaseQuery<IEvxTokenQueryParams, string> {
  constructor(
    @inject(EvxGovernanceContract)
    private readonly governance: EvxGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the Evx token address
   * @param params The parameters for the query (empty for evxToken function)
   * @returns The Evx token address as a string
   */
  async execute(_?: IEvxTokenQueryParams): Promise<string> {
    return await this.governance.instance.evxToken();
  }
}
