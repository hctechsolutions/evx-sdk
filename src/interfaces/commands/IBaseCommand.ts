export interface IBaseCommand<Params, Output> {
  execute(params: Params): Promise<Output>;
}
