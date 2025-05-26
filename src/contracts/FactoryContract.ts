import { NebularFactory, NebularFactory__factory } from '@interfaces/contracts';
import { IBaseContract } from '@interfaces/contracts/IBaseContract';
import { injectable, registry, inject } from 'tsyringe';
import { BlockchainProvider } from '@providers/blockchain/BlockchainProvider';

@injectable()
@registry([{ token: NebularFactoryContract, useClass: NebularFactoryContract }])
export class NebularFactoryContract implements IBaseContract<NebularFactory> {
  public readonly instance: NebularFactory;
  public readonly address: string;

  constructor(
    @inject(BlockchainProvider)
    readonly provider: BlockchainProvider
  ) {
    if (!process.env.POOL_FACTORY) {
      throw new Error("POOL_FACTORY environment variable not found");
    }

    this.address = process.env.POOL_FACTORY
    this.instance = NebularFactory__factory.connect(
      this.address,
      provider
    );
  }
}
