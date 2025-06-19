export interface IPoolCreatedEvent {
  token0: string;
  token1: string;
  fee: bigint;
  tickSpacing: bigint;
  pool: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
} 