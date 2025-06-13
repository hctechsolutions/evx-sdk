import { JsonRpcProvider } from 'ethers';

export interface IRPC {
  provider: JsonRpcProvider | null;
  setProvider(newRPC: string): void
}
