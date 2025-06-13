import { IRPC } from '@interfaces/providers/IRPC';
import { JsonRpcProvider } from 'ethers';
import { singleton } from 'tsyringe';

@singleton()
export class RPC implements IRPC {
  provider: JsonRpcProvider | null;

  constructor() {
    this.provider = new JsonRpcProvider('::1');
  }

  setProvider(newRPC: string) {
    this.provider = new JsonRpcProvider(newRPC);
  }
}
