import NebularFactoryABI from '@abis/NebularFactory.json';
import { injectable, inject, singleton } from 'tsyringe';
import { BaseContract } from './BaseContract';
import { RPC } from '@providers';

@injectable()
@singleton()
export class FactoryContract extends BaseContract {
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('factory', rpc, NebularFactoryABI);
  }
}
