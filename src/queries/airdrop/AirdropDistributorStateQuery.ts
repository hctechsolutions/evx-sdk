import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { AirdropDistributorContract } from '@contracts';

export type IAirdropDistributorState = {
  merkleRoot: string;
  claimDeadline: bigint;
  distributionIdHash: string;
  totalAllocated: bigint;
  claimedAmount: bigint;
  token: string;
  treasury: string;
  unclaimedSwept: boolean;
};

/**
 * @title Airdrop Distributor State Query
 * @notice Live read of immutable/view fields for readiness + economics
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class AirdropDistributorStateQuery
  implements IBaseQuery<void, IAirdropDistributorState>
{
  constructor(
    @inject(AirdropDistributorContract)
    private readonly distributor: AirdropDistributorContract
  ) {}

  async execute(): Promise<IAirdropDistributorState> {
    const d = this.distributor.instance;
    const [
      merkleRoot,
      claimDeadline,
      distributionIdHash,
      totalAllocated,
      claimedAmount,
      token,
      treasury,
      unclaimedSwept
    ] = await Promise.all([
      d.merkleRoot() as Promise<string>,
      d.claimDeadline() as Promise<bigint>,
      d.distributionIdHash() as Promise<string>,
      d.totalAllocated() as Promise<bigint>,
      d.claimedAmount() as Promise<bigint>,
      d.token() as Promise<string>,
      d.treasury() as Promise<string>,
      d.unclaimedSwept() as Promise<boolean>
    ]);
    return {
      merkleRoot,
      claimDeadline,
      distributionIdHash,
      totalAllocated,
      claimedAmount,
      token,
      treasury,
      unclaimedSwept
    };
  }
}
