import { IGetStateQueryParams } from '@interfaces/queries/params/IGetStateQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';
import { ProposalState } from '@enums/ProposalState';

/**
 * @title Get State Query
 * @notice Retrieves the current state of a specific proposal
 * @dev Queries the governance contract to get the current state of a proposal
 */
@injectable()
@singleton()
export class GetStateQuery implements IBaseQuery<IGetStateQueryParams, ProposalState> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal state
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal state as a ProposalState enum value
   */
  async execute(params: IGetStateQueryParams): Promise<ProposalState> {
    const result = await this.governance.instance.state(params.proposalId);
    return result as ProposalState;
  }
}
