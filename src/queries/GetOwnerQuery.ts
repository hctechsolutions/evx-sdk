import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

@injectable()
@singleton()
export class GetOwnerQuery implements IBaseQuery<void, string> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  async execute(): Promise<string> {
    return await this.factory.instance.owner();
  }
} 