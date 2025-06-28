export interface IEventListener<T> {
  /**
   * Start listening for events
   * @param callback Function to call when event is received
   * @param fromBlock Starting block number (optional)
   */
  start(callback: (event: T) => void | Promise<void>, fromBlock?: number): Promise<void>;

  /**
   * Stop listening for events
   */
  stop(): void;

  /**
   * Get historical events
   * @param fromBlock Starting block number
   * @param toBlock Ending block number or "latest" (optional, defaults to latest)
   */
  getHistoricalEvents(fromBlock: number, toBlock?: number | "latest"): Promise<T[]>;

  /**
   * Add a callback to the listener
   * @param callback Function to call when event is received
   */
  addCallback(callback: (event: T) => void | Promise<void>): void;

  /**
   * Remove a callback from the listener
   * @param callback Function to remove
   */
  removeCallback(callback: (event: T) => void | Promise<void>): void;

  /**
   * Check if the listener is currently active
   */
  readonly listening: boolean;
}
