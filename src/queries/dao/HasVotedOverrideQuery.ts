import { IHasVotedOverrideQueryParams } from '@interfaces/queries/params/IHasVotedOverrideQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Has Voted Override Query
 * @notice Checks if a specific account has voted with override on a given proposal
 * @dev Queries the governance contract to check the override voting status of an account for a specific proposal
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class HasVotedOverrideQuery implements IBaseQuery<IHasVotedOverrideQueryParams, boolean> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the query to check if an account has voted with override
   * @param params The parameters for the query containing proposal ID and account address
   * @returns True if the account has voted with override, false otherwise
   */
  async execute(params: IHasVotedOverrideQueryParams): Promise<boolean> {
    return await this.governance.instance.hasVotedOverride(params.proposalId, params.account);
  }
}
