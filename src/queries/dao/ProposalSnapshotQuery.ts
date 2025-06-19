import { IProposalSnapshotQueryParams } from '@interfaces/queries/params/IProposalSnapshotQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Proposal Snapshot Query
 * @notice Retrieves the snapshot for a specific proposal
 * @dev Queries the governance contract to get the snapshot block/timestamp for a proposal
 */
@injectable()
@singleton()
export class ProposalSnapshotQuery implements IBaseQuery<IProposalSnapshotQueryParams, bigint> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly governance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the proposal snapshot
   * @param params The parameters for the query containing proposal ID
   * @returns The proposal snapshot as a bigint
   */
  async execute(params: IProposalSnapshotQueryParams): Promise<bigint> {
    return await this.governance.instance.proposalSnapshot(params.proposalId);
  }
}
