import { IIsClaimedQueryParams } from '@interfaces/queries/params/IIsClaimedQueryParams';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { AirdropDistributorContract } from '@contracts';

/**
 * @title Is Claimed Query
 * @notice Live read of EvxAirdropDistributor.isClaimed(index) for Platform (D13)
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class IsClaimedQuery implements IBaseQuery<IIsClaimedQueryParams, boolean> {
  constructor(
    @inject(AirdropDistributorContract)
    private readonly distributor: AirdropDistributorContract
  ) {}

  async execute(params: IIsClaimedQueryParams): Promise<boolean> {
    return this.distributor.instance.isClaimed(params.index) as Promise<boolean>;
  }
}
