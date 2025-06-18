import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast override vote operation on a governance proposal
 * @dev Extends base command parameters with cast override vote specific parameters
 */
export interface ICastOverrideVoteCommandParams extends IBaseCommandParams {
  proposalId: bigint;   // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  reason: string;       // The reason for the vote
}
