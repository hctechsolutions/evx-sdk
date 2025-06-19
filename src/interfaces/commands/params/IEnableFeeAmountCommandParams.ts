import { IBaseCommandParams } from './IBaseCommandParams';

/**
 * @notice Parameters for enabling a fee amount
 * @dev Extends base command parameters with fee amount enabling specific parameters
 */
export interface IEnableFeeAmountCommandParams extends IBaseCommandParams {
  fee: bigint; // The fee amount to enable (uint24)
  tickSpacing: bigint; // The tick spacing for this fee amount (int24)
} 