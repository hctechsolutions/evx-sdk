import PositionManagerABI from '@abis/NonfungiblePositionManager.json';
import { injectable, inject, singleton } from 'tsyringe';
import { BaseContract } from './BaseContract';
import { RPC } from '@providers';

@injectable()
@singleton()
export class PositionManagerContract extends BaseContract {
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('positionManager', rpc, PositionManagerABI);
  }
}
