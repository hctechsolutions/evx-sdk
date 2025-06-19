export interface IInitializeObservationEvent {
  sqrtPriceX96: bigint;
  tick: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 