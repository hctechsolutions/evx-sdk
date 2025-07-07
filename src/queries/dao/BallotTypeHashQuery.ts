import { IBallotTypeHashQueryParams } from '@interfaces/queries/params/IBallotTypeHashQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvexGovernanceContract } from '@contracts';

/**
 * @title Ballot Type Hash Query
 * @notice Retrieves the ballot type hash from the EvexGovernance contract
 * @dev Queries the governance contract to get the BALLOT_TYPEHASH for EIP-712 signatures
 */
@injectable()
@singleton()
export class BallotTypeHashQuery implements IBaseQuery<IBallotTypeHashQueryParams, string> {
  constructor(
    @inject(EvexGovernanceContract)
    private readonly governance: EvexGovernanceContract
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
