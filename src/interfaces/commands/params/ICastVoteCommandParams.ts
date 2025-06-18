import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast vote operation on a governance proposal
 * @dev Extends base command parameters with cast vote specific parameters
 */
export interface ICastVoteCommandParams extends IBaseCommandParams {
  proposalId: bigint; // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
}
