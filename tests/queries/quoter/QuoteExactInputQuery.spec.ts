import { QuoteExactInputQuery } from '@queries/quoter/QuoteExactInputQuery';
import { QuoterContract } from '@contracts';
import { RPC } from '@providers';
import { ErrorExtractor } from '@utils/errors/ErrorExtractor';
import { container } from 'tsyringe';
import { Contract } from 'ethers';

jest.mock('@contracts');
jest.mock('@providers');
jest.mock('@utils/errors/ErrorExtractor');

describe('QuoteExactInputQuery', () => {
  let query: QuoteExactInputQuery;
  let quoterContract: jest.Mocked<QuoterContract>;
  let rpc: jest.Mocked<RPC>;
  let errorExtractor: jest.Mocked<ErrorExtractor>;

  beforeEach(() => {
    container.clearInstances();

    errorExtractor = {
      extractContractError: jest.fn()
    } as any;

    quoterContract = {
      instance: {
        quoteExactInput: {
          staticCall: jest.fn().mockImplementation(() => Promise.resolve([
            BigInt(1000), // amountOut
            [BigInt(100), BigInt(200)], // sqrtPriceX96AfterList
            [1, 2], // initializedTicksCrossedList
            BigInt(50000), // gasEstimate
          ])),
        },
        interface: {} as any,
      } as unknown as Contract,
    } as any;

    rpc = {
      provider: {} as any,
    } as any;

    (QuoterContract as jest.Mock).mockImplementation(() => quoterContract);
    (RPC as jest.Mock).mockImplementation(() => rpc);
    (ErrorExtractor as jest.Mock).mockImplementation(() => errorExtractor);

    query = container.resolve(QuoteExactInputQuery);
  });

  it('should return quote data when executed', async () => {
    const params = {
      path: '0x1234',
      amountIn: BigInt(100),
    };

    const result = await query.execute(params);

    expect(quoterContract.instance.quoteExactInput.staticCall).toHaveBeenCalledWith(
      params.path,
      params.amountIn
    );

    expect(result).toEqual({
      amountOut: BigInt(1000),
      sqrtPriceX96AfterList: [BigInt(100), BigInt(200)],
      initializedTicksCrossedList: [1, 2],
      gasEstimate: BigInt(50000),
    });
  });

  describe('Error handling', () => {
    it('should extract and throw error with contractError when quote fails with Panic', async () => {
      const params = {
        path: '0x1234',
        amountIn: BigInt(100),
      };

      const panicError = new Error('execution reverted: 0x4e487b710000000000000000000000000000000000000000000000000000000000000012');
      (panicError as any).data = '0x4e487b710000000000000000000000000000000000000000000000000000000000000012';
      
      quoterContract.instance.quoteExactInput.staticCall.mockRejectedValueOnce(panicError);
      
      errorExtractor.extractContractError.mockReturnValue({
        errorCode: '0x4e487b71',
        errorMessage: 'PanicDivisionByZero',
        errorArgs: [BigInt(0x12)],
        originalErrorData: '0x4e487b710000000000000000000000000000000000000000000000000000000000000012'
      });

      await expect(query.execute(params)).rejects.toThrow('Quote failed: PanicDivisionByZero');
      
      expect(errorExtractor.extractContractError).toHaveBeenCalledWith(
        panicError,
        quoterContract.instance.interface
      );
    });

    it('should extract and throw error when quote fails with PoolQuoteFailed containing NoLiquidity', async () => {
      const params = {
        path: '0x1234',
        amountIn: BigInt(100),
      };

      const poolError = new Error('execution reverted');
      (poolError as any).data = '0xfde84cf5000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000044e14a96700000000000000000000000000000000000000000000000000000000';
      
      quoterContract.instance.quoteExactInput.staticCall.mockRejectedValueOnce(poolError);
      
      // Simular que o ErrorExtractor extrai o erro NoLiquidity aninhado
      errorExtractor.extractContractError.mockReturnValue({
        errorCode: '0x4e14a967',
        errorMessage: 'NoLiquidity',
        originalErrorData: '0x4e14a967'
      });

      await expect(query.execute(params)).rejects.toThrow('Quote failed: NoLiquidity');
    });
  });
}); 