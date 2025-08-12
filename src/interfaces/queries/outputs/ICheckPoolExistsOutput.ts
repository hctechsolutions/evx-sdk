/**
 * @notice Output of the check pool exists query
 * @dev Contains the pool address and existence status
 */
export interface ICheckPoolExistsOutput {
  exists: boolean; // Whether the pool exists
  poolAddress: string; // The address of the pool (zero address if not exists)
}
