import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast vote with reason and params by signature operation on a governance proposal
 * @dev Extends base command parameters with cast vote with reason and params by sig specific parameters
 */
export interface ICastVoteWithReasonAndParamsBySigCommandParams extends IBaseCommandParams {
  proposalId: bigint; // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  voter: string; // The address of the voter
  reason: string; // The reason for the vote
  params: string; // Additional parameters as bytes (hex string)
  signature: string | Uint8Array | Buffer; // The signature
}
