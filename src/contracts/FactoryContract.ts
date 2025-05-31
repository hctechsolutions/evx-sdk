import { BlockchainProvider } from '@providers/blockchain/BlockchainProvider';
import { IBaseContract } from '@interfaces/contracts/IBaseContract';
import NebularFactoryABI from '@abis/NebularFactory.json';
import { injectable, registry, inject } from 'tsyringe';
import { ethers } from 'ethers';

@injectable()
@registry([{ token: NebularFactoryContract, useClass: NebularFactoryContract }])
export class NebularFactoryContract implements IBaseContract {
  public readonly instance: ethers.Contract;
  public readonly address: string = "0x822AC7faa4EdA0bfA4c9A4eb5EeeB43d3Cba9CC7";

  constructor(
    @inject(BlockchainProvider)
    readonly provider: BlockchainProvider
  ) {
    this.instance = new ethers.Contract(
      this.address,
      NebularFactoryABI,
      provider
    );
  }
}
