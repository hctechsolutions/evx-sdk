import { ISupportsInterfaceQueryParams } from '@interfaces/queries/params/ISupportsInterfaceQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Supports Interface Query
 * @notice Checks if the contract supports a specific interface
 * @dev Queries the governance contract to check if it supports a given interface ID
 */
@injectable()
@singleton()
export class SupportsInterfaceQuery implements IBaseQuery<ISupportsInterfaceQueryParams, boolean> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to check interface support
   * @param params The parameters for the query containing the interface ID
   * @returns True if the interface is supported, false otherwise
   */
  async execute(params: ISupportsInterfaceQueryParams): Promise<boolean> {
    return await this.governance.instance.supportsInterface(params.interfaceId);
  }
}
