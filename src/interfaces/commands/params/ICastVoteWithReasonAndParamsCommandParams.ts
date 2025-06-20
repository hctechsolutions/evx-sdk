import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast vote with reason and params operation on a governance proposal
 * @dev Extends base command parameters with cast vote with reason and params specific parameters
 */
export interface ICastVoteWithReasonAndParamsCommandParams extends IBaseCommandParams {
  proposalId: bigint; // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  reason: string; // The reason for the vote
  params: string; // Additional parameters as bytes (hex string)
}
