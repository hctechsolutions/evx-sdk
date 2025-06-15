export interface IPopulatedTick {
  tick: number;
  liquidityNet: bigint;
  liquidityGross: bigint;
}

export interface IGetPopulatedTicksOutput {
  populatedTicks: IPopulatedTick[];
} 