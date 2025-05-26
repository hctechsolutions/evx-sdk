import { JsonRpcProvider } from 'ethers';

export interface IBlockchainProvider {
  readonly provider: JsonRpcProvider;
}
