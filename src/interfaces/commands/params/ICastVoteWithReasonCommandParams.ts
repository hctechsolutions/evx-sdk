import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast vote with reason operation on a governance proposal
 * @dev Extends base command parameters with cast vote with reason specific parameters
 */
export interface ICastVoteWithReasonCommandParams extends IBaseCommandParams {
  proposalId: bigint; // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  reason: string; // The reason for the vote
} 