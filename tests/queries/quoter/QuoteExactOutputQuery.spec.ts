import { QuoteExactOutputQuery } from '@queries/quoter/QuoteExactOutputQuery';
import { RPC } from '@providers';
import { QuoterContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('QuoteExactOutputQuery', () => {
  let query: QuoteExactOutputQuery;
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
        quoteExactOutput: {
          staticCall: staticCallMock
        }
      }
    } as any;

    (QuoterContract as jest.Mock).mockImplementation(() => mockQuoterContract);
    
    container.registerInstance(RPC, mockRPC);
    query = container.resolve(QuoteExactOutputQuery);
  });

  it('should execute quote exact output query successfully', async () => {
    const mockParams = {
      path: '0x123',
      amountOut: BigInt(1000000)
    };

    const mockResult = [
      BigInt(2000000), // amountIn
      [BigInt(123456), BigInt(789012)], // sqrtPriceX96AfterList
      [1, 2], // initializedTicksCrossedList
      BigInt(100000) // gasEstimate
    ];

    (mockQuoterContract.instance.quoteExactOutput.staticCall as jest.Mock).mockResolvedValue(mockResult);

    const result = await query.execute(mockParams);

    expect(mockQuoterContract.instance.quoteExactOutput.staticCall).toHaveBeenCalledWith(
      mockParams.path,
      mockParams.amountOut
    );

    expect(result).toEqual({
      amountIn: mockResult[0],
      sqrtPriceX96AfterList: mockResult[1],
      initializedTicksCrossedList: mockResult[2],
      gasEstimate: mockResult[3]
    });
  });

  it('should throw error when quote exact output fails', async () => {
    const mockParams = {
      path: '0x123',
      amountOut: BigInt(1000000)
    };

    const error = new Error('Quote failed');
    (mockQuoterContract.instance.quoteExactOutput.staticCall as jest.Mock).mockRejectedValue(error);

    await expect(query.execute(mockParams)).rejects.toThrow('Quote failed');
  });
}); 