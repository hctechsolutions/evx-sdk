export interface IBaseCommandParams<T = any> {
  /**
   * Called when the operation is successfully completed.
   * Can be synchronous or return a Promise.
   */
  onDone?: (output?: T) => void | Promise<void>;

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
