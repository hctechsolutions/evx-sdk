import { QuoteExactOutputSingleQuery } from '@queries/quoter/QuoteExactOutputSingleQuery';
import { RPC } from '@providers';
import { QuoterContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('QuoteExactOutputSingleQuery', () => {
  let query: QuoteExactOutputSingleQuery;
  let mockRPC: jest.Mocked<RPC>;
  let mockQuoterContract: jest.Mocked<QuoterContract>;

  beforeEach(() => {
    container.clearInstances();
    
    mockRPC = {
      provider: {} as any,
      getProvider: jest.fn(),
      getSigner: jest.fn()
    } as any;

    const staticCallMock = jest.fn();
    mockQuoterContract = {
      instance: {
        quoteExactOutputSingle: {
          staticCall: staticCallMock
        }
      }
    } as any;

    (QuoterContract as jest.Mock).mockImplementation(() => mockQuoterContract);
    
    container.registerInstance(RPC, mockRPC);
    query = container.resolve(QuoteExactOutputSingleQuery);
  });

  it('should execute quote exact output single query successfully', async () => {
    const mockParams = {
      tokenIn: '0x123',
      tokenOut: '0x456',
      amount: BigInt(1000000),
      fee: BigInt(3000)
    };

    const mockResult = [
      BigInt(2000000), // amountIn
      BigInt(123456), // sqrtPriceX96After
      BigInt(1), // initializedTicksCrossed
      BigInt(100000) // gasEstimate
    ];

    (mockQuoterContract.instance.quoteExactOutputSingle.staticCall as jest.Mock).mockResolvedValue(mockResult);

    const result = await query.execute(mockParams);

    expect(mockQuoterContract.instance.quoteExactOutputSingle.staticCall).toHaveBeenCalledWith({
      tokenIn: mockParams.tokenIn,
      tokenOut: mockParams.tokenOut,
      amount: mockParams.amount,
      fee: mockParams.fee,
      sqrtPriceLimitX96: 0n
    });

    expect(result).toEqual({
      amountIn: mockResult[0],
      sqrtPriceX96After: mockResult[1],
      initializedTicksCrossed: mockResult[2],
      gasEstimate: mockResult[3]
    });
  });

  it('should throw error when quote exact output single fails', async () => {
    const mockParams = {
      tokenIn: '0x123',
      tokenOut: '0x456',
      amount: BigInt(1000000),
      fee: BigInt(3000)
    };

    const error = new Error('Quote failed');
    (mockQuoterContract.instance.quoteExactOutputSingle.staticCall as jest.Mock).mockRejectedValue(error);

    await expect(query.execute(mockParams)).rejects.toThrow('Quote failed');
  });
}); 