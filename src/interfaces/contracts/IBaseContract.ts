export interface IBaseContract<T> {
  readonly address: string;
  readonly instance: T;
}
