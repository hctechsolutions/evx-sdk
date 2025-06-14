import { IBaseCommandParams } from "./IBaseCommandParams"
import { Signer } from "ethers";

/**
 * @notice Parameters for initializing a pool
 * @dev Extends base command parameters with initialization specific parameters
 */
export interface IInitializePoolCommandParams extends IBaseCommandParams {
  /** The initial price to set for the pool */
  initialPrice: bigint
}

/**
 * @notice Parameters for initializing only a pool (with address and signer)
 * @dev Extends initialization parameters with pool address and signer
 */
export interface IInitializeOnlyPoolCommandParams extends IInitializePoolCommandParams {
  /** The address of the pool to initialize */
  poolAddress: string;
  /** The signer to use for the transaction */
  signer: Signer;
}
