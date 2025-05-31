import { BlockchainProvider } from '@providers/blockchain/BlockchainProvider';
import PositionManagerABI from '@abis/NonfungiblePositionManager.json';
import { IBaseContract } from '@interfaces/contracts/IBaseContract';
import { injectable, registry, inject } from 'tsyringe';
import { ethers } from 'ethers';

@injectable()
@registry([{ token: NonfungiblePositionManagerContract, useClass: NonfungiblePositionManagerContract }])
export class NonfungiblePositionManagerContract implements IBaseContract {
  public readonly instance: ethers.Contract;
  public readonly address: string = "0x29d077c93A7F5F1092E18B4883B26DD6c934de81";

  constructor(
    @inject(BlockchainProvider)
    readonly provider: BlockchainProvider
  ) {
    this.instance = new ethers.Contract(
      this.address,
      PositionManagerABI,
      provider
    );
  }
}
