/**
 * @notice Output for the get position query
 * @dev Contains all the position data returned by the contract
 */
export interface IGetPositionOutput {
  nonce: bigint;                    // The nonce of the position
  operator: string;                 // The address of the operator of the position
  token0: string;                   // The address of the first token in the position
  token1: string;                   // The address of the second token in the position
  fee: number;                      // The fee tier of the position
  tickLower: number;                // The lower tick of the position
  tickUpper: number;                // The upper tick of the position
  liquidity: bigint;                // The amount of liquidity in the position
  feeGrowthInside0LastX128: bigint; // The fee growth of token0 inside the position's range
  feeGrowthInside1LastX128: bigint; // The fee growth of token1 inside the position's range
  tokensOwed0: bigint;              // The amount of token0 owed to the position
  tokensOwed1: bigint;              // The amount of token1 owed to the position
} 