import { IGetFeeAmountTickSpacingQueryParams } from '@interfaces/queries/params/IGetFeeAmountTickSpacingQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

@injectable()
@singleton()
export class GetFeeAmountTickSpacingQuery implements IBaseQuery<IGetFeeAmountTickSpacingQueryParams, number> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  async execute(params: IGetFeeAmountTickSpacingQueryParams): Promise<number> {
    return await this.factory.instance.feeAmountTickSpacing(params.fee);
  }
} 