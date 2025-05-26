import { IBlockchainProvider } from '@interfaces/providers/IBlockchainProvider';
import { singleton, registry } from 'tsyringe';
import { JsonRpcProvider } from 'ethers';

@singleton()
@registry([{ token: BlockchainProvider, useClass: BlockchainProvider }])
export class BlockchainProvider implements IBlockchainProvider {
  readonly provider: JsonRpcProvider;

  constructor() {
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
  }
}