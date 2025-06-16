/**
 * @notice Represents a generic query that can be executed with parameters to produce a result.
 * @dev This interface follows the query Pattern, where an action is encapsulated in an object.
 *
 * @template Params The type of the input parameters required to execute the query.
 * @template Output The type of the result returned by the query.
 */
export interface IBaseQuery<Params, Output> {
  /**
   * @notice Executes the query with the provided parameters.
   * @dev Implement this method to define the query's behavior.
   *
   * @param params Input data required to execute the query.
   * @return A promise that resolves with the query result.
   */
  execute(params: Params): Promise<Output>;
}
