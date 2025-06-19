import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for updating the quorum numerator in governance
 * @dev Extends base command parameters with quorum numerator specific parameters
 */
export interface IUpdateQuorumNumeratorCommandParams extends IBaseCommandParams {
  newQuorumNumerator: bigint; // New quorum numerator value
}
