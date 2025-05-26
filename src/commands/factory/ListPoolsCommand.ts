import { PoolCreatedEvent } from '@interfaces/contracts/NebularFactory';
import { NebularFactoryContract } from '@contracts/FactoryContract';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, registry, inject } from 'tsyringe';

@injectable()
@registry([{ token: ListPoolsCommand, useClass: ListPoolsCommand }])
export class ListPoolsCommand implements IBaseCommand<null, PoolCreatedEvent.OutputObject[]> {
  constructor(
    @inject(NebularFactoryContract)
    private readonly factory: NebularFactoryContract) {}

  async execute(): Promise<PoolCreatedEvent.OutputObject[]> {
    const pastEvents = await this.factory.instance.queryFilter(
      this.factory.instance.filters.PoolCreated(),
      Number(process.env.DEPLOYED_IN_BLOCK) || 0,
      'latest'
    );

    return pastEvents.map(evt => {
      const { token0, token1, fee, tickSpacing, pool } = evt.args;
      return { token0, token1, fee, tickSpacing, pool };
    });
  }
}
