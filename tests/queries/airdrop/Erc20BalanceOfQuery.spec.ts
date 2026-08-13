import { Erc20BalanceOfQuery } from '@queries/airdrop';
import { RPC } from '@providers';
import { ethers } from 'ethers';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  const Contract = jest.fn();
  return {
    ...actual,
    Contract,
    ethers: {
      ...actual.ethers,
      Contract,
      isAddress: actual.ethers.isAddress
    }
  };
});

describe('Erc20BalanceOfQuery', () => {
  let query: Erc20BalanceOfQuery;
  let rpc: { provider: object };
  const token = '0x1111111111111111111111111111111111111111';
  const account = '0x2222222222222222222222222222222222222222';

  beforeEach(() => {
    jest.clearAllMocks();
    rpc = { provider: {} };
    query = new Erc20BalanceOfQuery(rpc as RPC);
  });

  it('returns balanceOf for valid addresses', async () => {
    const balanceOf = jest.fn().mockResolvedValue(42n);
    (ethers.Contract as unknown as jest.Mock).mockImplementation(() => ({
      balanceOf
    }));

    const result = await query.execute({ tokenAddress: token, account });

    expect(ethers.Contract).toHaveBeenCalled();
    expect(balanceOf).toHaveBeenCalledWith(account);
    expect(result).toBe(42n);
  });

  it('rejects missing params', async () => {
    await expect(
      query.execute({ tokenAddress: '', account } as any)
    ).rejects.toThrow(/required/);
  });

  it('rejects invalid addresses', async () => {
    await expect(
      query.execute({ tokenAddress: 'not-an-address', account })
    ).rejects.toThrow(/invalid/);
  });
});
