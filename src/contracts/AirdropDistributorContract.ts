import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import AirdropDistributorABI from '@abis/AirdropDistributor.json';
import { inject, injectable, scoped, Lifecycle } from 'tsyringe';

/**
 * @title Airdrop Distributor Contract
 * @notice Wrapper for EvxAirdropDistributor (Uniswap MerkleDistributor–style)
 * @dev Web uses populateTransaction on instance.claim — never Command.execute in browser
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class AirdropDistributorContract extends BaseContract {
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('airdropDistributor', rpc, AirdropDistributorABI);
  }
}
