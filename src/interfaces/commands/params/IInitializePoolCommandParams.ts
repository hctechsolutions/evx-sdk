import { IBaseCommandParams } from "./IBaseCommandParams"
import { Signer } from "ethers";

/**
 * @notice Parameters for initializing a pool
 * @dev Extends base command parameters with initialization specific parameters
 */
export interface IInitializePoolCommandParams extends IBaseCommandParams {
  initialPrice: bigint // The initial price to set for the pool
}

/**
 * @notice Parameters for initializing only a pool (with address and signer)
 * @dev Extends initialization parameters with pool address and signer
 */
export interface IInitializeOnlyPoolCommandParams extends IInitializePoolCommandParams {
  poolAddress: string; // The address of the pool to initialize
  signer: Signer; // The signer to use for the transaction
}
