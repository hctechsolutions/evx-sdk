import { IExtendedBallotTypeHashQueryParams } from '@interfaces/queries/params/IExtendedBallotTypeHashQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Extended Ballot Type Hash Query
 * @notice Retrieves the extended ballot type hash from the NebularGovernance contract
 * @dev Queries the governance contract to get the EXTENDED_BALLOT_TYPEHASH for extended EIP-712 signatures
 */
@injectable()
@singleton()
export class ExtendedBallotTypeHashQuery
  implements IBaseQuery<IExtendedBallotTypeHashQueryParams, string>
{
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the extended ballot type hash
   * @param params The parameters for the query (empty for EXTENDED_BALLOT_TYPEHASH function)
   * @returns The extended ballot type hash as a string
   */
  async execute(_?: IExtendedBallotTypeHashQueryParams): Promise<string> {
    return await this.governance.instance.EXTENDED_BALLOT_TYPEHASH();
  }
}
