import { IBaseQueryParams } from '../IBaseQueryParams';

export interface IGetPopulatedTicksQueryParams extends IBaseQueryParams {
  pool: string;
  tickBitmapIndex: number;
} 