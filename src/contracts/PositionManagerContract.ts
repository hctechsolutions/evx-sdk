import PositionManagerABI from '@abis/NonfungiblePositionManager.json';
import { injectable, inject, singleton } from 'tsyringe';
import { RPC } from '@providers/RPC';
import { BaseContract } from './BaseContract';

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
