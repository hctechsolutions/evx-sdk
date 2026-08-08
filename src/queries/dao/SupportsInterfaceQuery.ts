import { ISupportsInterfaceQueryParams } from '@interfaces/queries/params/ISupportsInterfaceQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Supports Interface Query
 * @notice Checks if the contract supports a specific interface
 * @dev Queries the governance contract to check if it supports a given interface ID
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class SupportsInterfaceQuery implements IBaseQuery<ISupportsInterfaceQueryParams, boolean> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
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
