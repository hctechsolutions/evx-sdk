import { IBaseCommandParams } from './IBaseCommandParams';
import { Signer } from 'ethers';

/**
 * @notice Parameters for updating a pool's dynamic swap fee
 * @dev Extends base command parameters with setDynamicFee-specific fields
 */
export interface ISetDynamicFeeCommandParams extends IBaseCommandParams {
  poolAddress: string;
  newFee: bigint;
  signer: Signer;
}
