import { IOverrideBallotTypeHashQueryParams } from '@interfaces/queries/params/IOverrideBallotTypeHashQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Override Ballot Type Hash Query
 * @notice Retrieves the override ballot type hash from the Governance contract
 * @dev Queries the governance contract to get the OVERRIDE_BALLOT_TYPEHASH for override EIP-712 signatures
 */
@injectable()
@singleton()
export class OverrideBallotTypeHashQuery
  implements IBaseQuery<IOverrideBallotTypeHashQueryParams, string>
{
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the override ballot type hash
   * @param params The parameters for the query (empty for OVERRIDE_BALLOT_TYPEHASH function)
   * @returns The override ballot type hash as a string
   */
  async execute(_?: IOverrideBallotTypeHashQueryParams): Promise<string> {
    return await this.governance.instance.OVERRIDE_BALLOT_TYPEHASH();
  }
}
