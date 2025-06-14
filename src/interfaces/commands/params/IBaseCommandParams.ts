/**
 * @notice Base interface for command parameters that includes callback functions
 * @dev Provides standard callback functions for handling command execution lifecycle
 */
export interface IBaseCommandParams {
  /**
   * @notice Called when the operation is successfully completed
   * @dev Can be synchronous or return a Promise
   * @param receipt The transaction receipt or result of the operation
   */
  onDone?: (receipt: any) => void;

  /**
   * @notice Called when the operation fails
   * @dev Can be synchronous or return a Promise
   * @param error The error information
   */
  onFail?: (error: any) => void;

  /**
   * @notice Called when a transaction is submitted or detected
   * @dev Can be synchronous or return a Promise
   * @param hash The transaction hash
   */
  onTransaction?: (hash: string) => void;
}
