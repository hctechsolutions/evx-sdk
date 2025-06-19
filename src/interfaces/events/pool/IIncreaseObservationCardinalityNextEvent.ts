export interface IIncreaseObservationCardinalityNextEvent {
  observationCardinalityNextOld: number;
  observationCardinalityNextNew: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
