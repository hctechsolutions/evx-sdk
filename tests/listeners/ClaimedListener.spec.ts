import { ClaimedListener } from '@listeners';
import { AirdropDistributorContract } from '@contracts';
import { container } from 'tsyringe';
import { Interface } from 'ethers';
import AirdropDistributorABI from '@abis/AirdropDistributor.json';

jest.mock('@contracts');

describe('ClaimedListener', () => {
  let listener: ClaimedListener;
  let mockDistributor: jest.Mocked<AirdropDistributorContract>;

  beforeEach(() => {
    container.clearInstances();

    const mockFilter = { filter: 'mock' };
    mockDistributor = {
      instance: {
        filters: {
          Claimed: jest.fn().mockReturnValue(mockFilter)
        },
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn()
      }
    } as any;

    container.registerInstance(AirdropDistributorContract, mockDistributor);
    listener = container.resolve(ClaimedListener);
  });

  it('should start listening for Claimed events', async () => {
    const callback = jest.fn();
    await listener.start(callback);

    expect(mockDistributor.instance.filters.Claimed).toHaveBeenCalled();
    expect(mockDistributor.instance.on).toHaveBeenCalled();
    expect(listener.listening).toBe(true);
  });

  it('should get historical Claimed events', async () => {
    const mockEvents = [
      {
        args: [0n, '0x1111111111111111111111111111111111111111', 100n * 10n ** 18n],
        blockNumber: 100,
        transactionHash: '0xclaimtx',
        index: 0
      }
    ];
    (mockDistributor.instance.queryFilter as jest.Mock).mockResolvedValue(mockEvents);

    const result = await listener.getHistoricalEvents(1, 200);

    expect(result).toEqual([
      {
        index: 0n,
        account: '0x1111111111111111111111111111111111111111',
        amount: 100n * 10n ** 18n,
        blockNumber: 100,
        transactionHash: '0xclaimtx',
        logIndex: 0
      }
    ]);
  });

  it('should stop listening', async () => {
    await listener.start(jest.fn());
    listener.stop();
    expect(mockDistributor.instance.removeAllListeners).toHaveBeenCalledWith('Claimed');
    expect(listener.listening).toBe(false);
  });
});

describe('Claimed event encode/decode', () => {
  it('round-trips Claimed via ABI Interface', () => {
    const iface = new Interface(AirdropDistributorABI as any);
    const index = 0n;
    const account = '0x1111111111111111111111111111111111111111';
    const amount = 100n * 10n ** 18n;

    const encoded = iface.encodeEventLog('Claimed', [index, account, amount]);
    const decoded = iface.decodeEventLog('Claimed', encoded.data, encoded.topics);

    expect(decoded.index).toEqual(index);
    expect(decoded.account.toLowerCase()).toBe(account.toLowerCase());
    expect(decoded.amount).toEqual(amount);
  });
});
