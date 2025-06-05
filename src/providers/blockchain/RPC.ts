import { IRPC } from '@interfaces/providers/IRPC';
import { singleton } from 'tsyringe';
import { JsonRpcProvider } from 'ethers';

@singleton()
export class RPC implements IRPC {
  readonly provider: JsonRpcProvider;

  constructor() {
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
  }
}
