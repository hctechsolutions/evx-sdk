export interface IBaseCommandParams {
  /**
   * Called when the operation is successfully completed.
   * Can be synchronous or return a Promise.
   */
  onDone?: () => void | Promise<void>;

  /**
   * Called when the operation fails.
   * Can be synchronous or return a Promise.
   * @param error Error information
   */
  onFail?: (error: Error) => void | Promise<void>;

  /**
   * Called when a transaction is submitted or detected.
   * Can be synchronous or return a Promise.
   * @param tx Transaction hash or object
   */
  onTransaction?: (hash: string) => void | Promise<void>;
}

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

