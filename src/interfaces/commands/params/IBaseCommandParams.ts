export interface IBaseCommandParams {
  /**
   * Called when the operation is successfully completed.
   * Can be synchronous or return a Promise.
   */
  onDone?: (receipt: any) => void;

  /**
   * Called when the operation fails.
   * Can be synchronous or return a Promise.
   * @param error Error information
   */
  onFail?: (error: any) => void;

  /**
   * Called when a transaction is submitted or detected.
   * Can be synchronous or return a Promise.
   * @param tx Transaction hash or object
   */
  onTransaction?: (hash: string) => void;
}
