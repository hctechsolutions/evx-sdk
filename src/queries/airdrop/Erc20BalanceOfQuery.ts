import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { ethers } from 'ethers';
import { RPC } from '@providers';
import ERC20ABI from '@abis/ERC20.json';

export type IErc20BalanceOfParams = {
  tokenAddress: string;
  account: string;
};

/**
 * @title ERC20 BalanceOf Query
 * @notice Token balance for funding invariant ( D20) — Platform Back only
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class Erc20BalanceOfQuery
  implements IBaseQuery<IErc20BalanceOfParams, bigint>
{
  constructor(
    @inject(RPC)
    private readonly rpc: RPC
  ) {}

  async execute(params: IErc20BalanceOfParams): Promise<bigint> {
    if (!params?.tokenAddress || !params?.account) {
      throw new Error('tokenAddress and account are required');
    }
    if (
      !ethers.isAddress(params.tokenAddress) ||
      !ethers.isAddress(params.account)
    ) {
      throw new Error('invalid tokenAddress or account');
    }
    const token = new ethers.Contract(
      params.tokenAddress,
      ERC20ABI,
      this.rpc.provider
    );
    return token.balanceOf(params.account) as Promise<bigint>;
  }
}
