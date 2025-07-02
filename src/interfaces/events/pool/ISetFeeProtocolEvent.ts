export interface ISetFeeProtocolEvent {
  feeProtocol0Old: number;
  feeProtocol1Old: number;
  feeProtocol0New: number;
  feeProtocol1New: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  poolAddress?: string;
}
