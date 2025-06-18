import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast override vote by signature operation on a governance proposal
 * @dev Extends base command parameters with cast override vote by signature specific parameters
 */
export interface ICastOverrideVoteBySigCommandParams extends IBaseCommandParams {
  proposalId: bigint;   // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  voter: string;        // The address of the voter
  reason: string;       // The reason for the vote
  signature: string;    // The signature for the vote
} 