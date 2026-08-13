import { AirdropDistributorStateQuery } from '@queries/airdrop';
import { AirdropDistributorContract } from '@contracts';

describe('AirdropDistributorStateQuery', () => {
  let query: AirdropDistributorStateQuery;
  let distributor: { instance: Record<string, jest.Mock> };

  beforeEach(() => {
    distributor = {
      instance: {
        merkleRoot: jest.fn(),
        claimDeadline: jest.fn(),
        distributionIdHash: jest.fn(),
        totalAllocated: jest.fn(),
        claimedAmount: jest.fn(),
        token: jest.fn(),
        treasury: jest.fn(),
        unclaimedSwept: jest.fn()
      }
    };

    query = new AirdropDistributorStateQuery(
      distributor as unknown as AirdropDistributorContract
    );
  });

  it('aggregates distributor view fields', async () => {
    distributor.instance.merkleRoot.mockResolvedValue('0xroot');
    distributor.instance.claimDeadline.mockResolvedValue(999n);
    distributor.instance.distributionIdHash.mockResolvedValue('0xid');
    distributor.instance.totalAllocated.mockResolvedValue(150n);
    distributor.instance.claimedAmount.mockResolvedValue(50n);
    distributor.instance.token.mockResolvedValue('0xtoken');
    distributor.instance.treasury.mockResolvedValue('0xtreas');
    distributor.instance.unclaimedSwept.mockResolvedValue(false);

    const result = await query.execute();

    expect(result).toEqual({
      merkleRoot: '0xroot',
      claimDeadline: 999n,
      distributionIdHash: '0xid',
      totalAllocated: 150n,
      claimedAmount: 50n,
      token: '0xtoken',
      treasury: '0xtreas',
      unclaimedSwept: false
    });
  });
});
