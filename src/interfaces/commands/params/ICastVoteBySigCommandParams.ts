import { IBaseCommandParams } from './IBaseCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

/**
 * @notice Parameters for executing a cast vote by signature operation on a governance proposal
 * @dev Extends base command parameters with cast vote by sig specific parameters
 */
export interface ICastVoteBySigCommandParams extends IBaseCommandParams {
  proposalId: bigint; // The ID of the proposal to vote on
  support: VoteSupport; // The vote support (Against, For, Abstain)
  voter: string; // The address of the voter
  signature: string | Uint8Array | Buffer; // The signature
}
