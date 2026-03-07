import { QuoteExactInputQuery } from '@queries/quoter/QuoteExactInputQuery';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';
import { container } from 'tsyringe';
import { Contract } from 'ethers';

jest.mock('@contracts');
jest.mock('@providers');

describe('QuoteExactInputQuery', () => {
  let query: QuoteExactInputQuery;
  let quoterContract: jest.Mocked<QuoterContract>;
  let rpc: jest.Mocked<RPC>;
  let staticCallMock: jest.Mock;

  beforeEach(() => {
    container.clearInstances();

    staticCallMock = jest.fn().mockImplementation(() =>
      Promise.resolve([
        BigInt(1000), // amountOut
        [BigInt(100), BigInt(200)], // sqrtPriceX96AfterList
        [1, 2], // initializedTicksCrossedList
        BigInt(50000) // gasEstimate
      ])
    );

    quoterContract = {
      instance: {
        quoteExactInput: {
          staticCall: staticCallMock
        },
        interface: {} as any
      } as unknown as Contract
    } as any;

    rpc = {
      provider: {} as any
    } as any;

    (QuoterContract as jest.Mock).mockImplementation(() => quoterContract);
    (RPC as jest.Mock).mockImplementation(() => rpc);

    query = container.resolve(QuoteExactInputQuery);
  });

  it('should return quote data when executed', async () => {
    const params = {
      path: '0x1234',
      amountIn: BigInt(100)
    };

    const result = await query.execute(params);

    expect(staticCallMock).toHaveBeenCalledWith(params.path, params.amountIn);

    expect(result).toEqual({
      amountOut: BigInt(1000),
      sqrtPriceX96AfterList: [BigInt(100), BigInt(200)],
      initializedTicksCrossedList: [1, 2],
      gasEstimate: BigInt(50000)
    });
  });

  it('should propagate error when quote fails', async () => {
    const params = {
      path: '0x1234',
      amountIn: BigInt(100)
    };

    const panicError = new Error('execution reverted');
    staticCallMock.mockRejectedValueOnce(panicError);

    await expect(query.execute(params)).rejects.toThrow('execution reverted');
  });
});
