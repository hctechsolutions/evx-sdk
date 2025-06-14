import { IBaseCommandParams } from "./IBaseCommandParams";

/**
 * @notice Parameters for creating a new pool
 * @dev Extends base command parameters with pool creation specific parameters
 */
export interface ICreatePoolCommandParams extends IBaseCommandParams {
  token0: string, // The address of the first token in the pool
  token1: string, // The address of the second token in the pool
  fee: bigint, // The fee tier for the pool
}
