import { JsonRpcProvider } from 'ethers';

export interface IRPC {
  readonly provider: JsonRpcProvider;
}
