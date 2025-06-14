import { IBaseCommandParams } from '@interfaces/commands/params/IBaseCommandParams';

/**
 * @notice Parameters for initializing a flash loan
 * @dev Contains all the parameters needed to initialize a flash loan
 */
export interface IInitFlashCommandParams extends IBaseCommandParams {
  token0: string;  // The address of the first token
  token1: string;  // The address of the second token
  fee1: number;    // The fee tier for the first pool
  amount0: bigint; // The amount of token0 to flash
  amount1: bigint; // The amount of token1 to flash
  fee2: number;    // The fee tier for the second pool
  fee3: number;    // The fee tier for the third pool
} 