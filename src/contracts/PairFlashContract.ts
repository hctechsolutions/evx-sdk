import { BaseContract } from './BaseContract';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import PairFlashAbi from '@abis/PairFlash.json';
import { RPC } from '@providers';

/**
 * @title Pair Flash Contract
 * @notice Contract for handling flash loans
 * @dev This contract interacts with the PairFlash contract
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class PairFlashContract extends BaseContract {
  constructor(
    @inject(RPC)
    rpc: RPC
  ) {
    super('pairFlash', rpc, PairFlashAbi);
  }
}
