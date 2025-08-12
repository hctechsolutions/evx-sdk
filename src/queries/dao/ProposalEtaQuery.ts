import { IProposalEtaQueryParams } from '@interfaces/queries/params/IProposalEtaQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvxGovernanceContract } from '@contracts';

/**
 * @title Proposal Eta Query
 * @notice Retrieves the eta for a specific proposal
 * @dev Queries the governance contract to get the eta timestamp for a proposal
 */
@injectable()
@singleton()
export class ProposalEtaQuery implements IBaseQuery<IProposalEtaQueryParams, bigint> {
  constructor(
    @inject(EvxGovernanceContract)
    private readonly governance: EvxGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal eta
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal eta as a bigint timestamp
   */
  async execute(params: IProposalEtaQueryParams): Promise<bigint> {
    return await this.governance.instance.proposalEta(params.proposalId);
  }
}
