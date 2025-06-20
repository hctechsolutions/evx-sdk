export interface IBurnEvent {
  owner: string;
  tickLower: number;
  tickUpper: number;
  amount: bigint;
  amount0: bigint;
  amount1: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
