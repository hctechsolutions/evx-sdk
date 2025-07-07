import { INoncesQueryParams } from '@interfaces/queries/params/INoncesQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Nonces Query
 * @notice Retrieves the nonce for a given owner address
 * @dev Queries the governance contract to get the nonce of an owner address
 */
@injectable()
@singleton()
export class NoncesQuery implements IBaseQuery<INoncesQueryParams, bigint> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the nonce
   * @param params The parameters for the query containing the owner address
   * @returns The nonce as a bigint
   */
  async execute(params: INoncesQueryParams): Promise<bigint> {
    return await this.governance.instance.nonces(params.owner);
  }
}
