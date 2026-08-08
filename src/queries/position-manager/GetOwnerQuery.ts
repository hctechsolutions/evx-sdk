import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { FactoryContract } from '@contracts';

/**
 * @title Get Owner Query
 * @notice Retrieves the owner address of the factory contract
 * @dev Queries the factory contract to get the current owner
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class GetOwnerQuery implements IBaseQuery<void, string> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  /**
   * @notice Executes the query to get the owner
   * @returns The address of the factory contract owner
   */
  async execute(): Promise<string> {
    return await this.factory.instance.owner();
  }
}
