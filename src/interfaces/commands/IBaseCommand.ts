/**
 * @notice Represents a generic command that can be executed with parameters to produce a result.
 * @dev This interface follows the Command Pattern, where an action is encapsulated in an object.
 *
 * @template Params The type of the input parameters required to execute the command.
 * @template Output The type of the result returned by the command.
 */
export interface IBaseCommand<Params, Output> {
  /**
   * @notice Executes the command with the provided parameters.
   * @dev Implement this method to define the command's behavior.
   *
   * @param params Input data required to execute the command.
   * @return A promise that resolves with the command result.
   */
  execute(params: Params): Promise<Output>;
}
