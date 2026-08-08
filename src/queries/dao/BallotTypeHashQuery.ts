import { IBallotTypeHashQueryParams } from '@interfaces/queries/params/IBallotTypeHashQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Ballot Type Hash Query
 * @notice Retrieves the ballot type hash from the Governance contract
 * @dev Queries the governance contract to get the BALLOT_TYPEHASH for EIP-712 signatures
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class BallotTypeHashQuery implements IBaseQuery<IBallotTypeHashQueryParams, string> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the ballot type hash
   * @param params The parameters for the query (empty for BALLOT_TYPEHASH function)
   * @returns The ballot type hash as a string
   */
  async execute(_?: IBallotTypeHashQueryParams): Promise<string> {
    return await this.governance.instance.BALLOT_TYPEHASH();
  }
}
