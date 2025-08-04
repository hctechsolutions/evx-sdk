import { IBaseQueryParams } from '@interfaces';

export interface IGetPopulatedTicksQueryParams extends IBaseQueryParams {
  pool: string;
  tickBitmapIndex: number;
}
