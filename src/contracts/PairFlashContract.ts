import { BaseContract } from './BaseContract';
import { injectable, inject, singleton } from 'tsyringe';
import PairFlashAbi from '@abis/PairFlash.json';
import { RPC } from '@providers';

/**
 * @title Pair Flash Contract
 * @notice Contract for handling flash loans
 * @dev This contract interacts with the PairFlash contract
 */
@injectable()
@singleton()
export class PairFlashContract extends BaseContract {
  constructor(
    @inject(RPC)
    rpc: RPC
  ) {
    super('pairFlash', rpc, PairFlashAbi);
  }
}
