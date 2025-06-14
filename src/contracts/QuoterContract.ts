import { BaseContract } from './BaseContract';
import { inject, injectable, singleton } from 'tsyringe';
import QuoterABI from '@abis/Quoter.json';
import { RPC } from '@providers';

/**
 * @title Quoter Contract
 * @notice Contract for getting quotes for swaps
 * @dev This contract is used to get quotes for swaps without executing them
 */
@injectable()
@singleton()
export class QuoterContract extends BaseContract {
  /**
   * @notice Creates a new Quoter contract instance
   * @param rpc The RPC provider instance
   */
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('swapQuoter', rpc, QuoterABI);
  }
} 