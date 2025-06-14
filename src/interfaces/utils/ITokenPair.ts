/**
 * @title Token Pair Interface
 * @notice Interface for representing a pair of token addresses
 * @dev Used for token pair operations and sorting
 */
export interface ITokenPair {
  token0: string; // The address of the first token
  token1: string; // The address of the second token
}
