import { QuoteExactInputSingleQuery } from '@queries/quoter/QuoteExactInputSingleQuery';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';
import { container } from 'tsyringe';
import { Contract } from 'ethers';

jest.mock('@contracts');
jest.mock('@providers');

describe('QuoteExactInputSingleQuery', () => {
  let query: QuoteExactInputSingleQuery;
  let quoterContract: jest.Mocked<QuoterContract>;
  let rpc: jest.Mocked<RPC>;

  beforeEach(() => {
    container.clearInstances();

    quoterContract = {
      instance: {
        quoteExactInputSingle: {
          staticCall: jest.fn().mockImplementation(() =>
           
              Promise.resolve([
                BigInt(1000), // amountOut
                BigInt(100), // sqrtPriceX96After
                1, // initilizedTicksCrossed
              
           BigInt(50000) // gasEstimate
           ])
          )
        }
      } as unknown as Contract
    } as any;

    rpc = {
      provider: {} as any
    } as any;

    (QuoterContract as jest.Mock).mockImplementation(() => quoterContract);
    (RPC as jest.Mock).mockImplementation(() => rpc);

    query = container.resolve(QuoteExactInputSingleQuery);
  });

  it('should return quote data when executed', async () => {
    const params = {
      tokenIn: '0x1234',
      tokenOut: '0x5678',
      fee: BigInt(500),
      amountIn: BigInt(100),
      sqrtPriceLimitX96: BigInt(0)
    };

    const result = await query.execute(params);

    expect(quoterContract.instance.quoteExactInputSingle.staticCall).toHaveBeenCalledWith({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      fee: params.fee,
      amountIn: params.amountIn,
      sqrtPriceLimitX96: params.sqrtPriceLimitX96
    });

    expect(result).toEqual({
      amountOut: BigInt(1000),
      sqrtPriceX96After: BigInt(100),
      initializedTicksCrossed: 1,
      gasEstimate: BigInt(50000)
    });
  });

  it('surfaces AD-26 code for InsufficientLiquidity revert', async () => {
    const { Interface } = await import('ethers');
    const iface = new Interface(['error InsufficientLiquidity()']);
    const data = iface.encodeErrorResult('InsufficientLiquidity', []);
    (
      quoterContract.instance.quoteExactInputSingle.staticCall as jest.Mock
    ).mockRejectedValue({ code: 'CALL_EXCEPTION', data });

    await expect(
      query.execute({
        tokenIn: '0x1',
        tokenOut: '0x2',
        fee: 3000n,
        amountIn: 1n,
        sqrtPriceLimitX96: 0n
      })
    ).rejects.toMatchObject({ code: 'insufficient_liquidity' });
  });

  it('does not invent AD-26 from opaque Panic CALL_EXCEPTION', async () => {
    (
      quoterContract.instance.quoteExactInputSingle.staticCall as jest.Mock
    ).mockRejectedValue({
      code: 'CALL_EXCEPTION',
      data: '0x4e487b710000000000000000000000000000000000000000000000000000000000000011'
    });

    await expect(
      query.execute({
        tokenIn: '0x1',
        tokenOut: '0x2',
        fee: 3000n,
        amountIn: 1n,
        sqrtPriceLimitX96: 0n
      })
    ).rejects.toMatchObject({ code: 'CALL_EXCEPTION' });
  });
});
