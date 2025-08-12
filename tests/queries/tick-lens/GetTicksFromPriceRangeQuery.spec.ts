import { GetTicksFromPriceRangeQuery } from '@queries/tick-lens/GetTicksFromPriceRangeQuery';
import { RPC } from '@providers';
import { TickLensContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('GetTicksFromPriceRangeQuery', () => {
  let query: GetTicksFromPriceRangeQuery;
  let mockRPC: jest.Mocked<RPC>;
  let mockTickLensContract: jest.Mocked<TickLensContract>;

  beforeEach(() => {
    container.clearInstances();

    mockRPC = {
      provider: {} as any,
      getProvider: jest.fn(),
      getSigner: jest.fn()
    } as any;

    const staticCallMock = jest.fn();
    mockTickLensContract = {
      instance: {
        getTicksFromPriceRange: {
          staticCall: staticCallMock
        }
      }
    } as any;

    container.registerInstance(RPC, mockRPC);
    container.registerInstance(TickLensContract, mockTickLensContract);
    query = container.resolve(GetTicksFromPriceRangeQuery);
  });

  it('should throw error when sqrtPriceLowerX96 is greater than sqrtPriceUpperX96', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 1000n,
      sqrtPriceUpperX96: 500n
    };

    await expect(query.execute(mockParams)).rejects.toThrow(
      'sqrtPriceLowerX96 must be less than sqrtPriceUpperX96'
    );
  });

  it('should throw error when sqrtPriceLowerX96 equals sqrtPriceUpperX96', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 1000n,
      sqrtPriceUpperX96: 1000n
    };

    await expect(query.execute(mockParams)).rejects.toThrow(
      'sqrtPriceLowerX96 must be less than sqrtPriceUpperX96'
    );
  });

  it('should throw error when sqrtPriceLowerX96 is zero', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 0n,
      sqrtPriceUpperX96: 1000n
    };

    await expect(query.execute(mockParams)).rejects.toThrow(
      'sqrtPriceLowerX96 and sqrtPriceUpperX96 must be positive'
    );
  });

  it('should throw error when sqrtPriceUpperX96 is zero', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 500n,
      sqrtPriceUpperX96: 0n
    };

    await expect(query.execute(mockParams)).rejects.toThrow(
      'sqrtPriceLowerX96 and sqrtPriceUpperX96 must be positive'
    );
  });

  it('should execute get ticks from price range query successfully', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 79228162514264337593543950336n, // sqrt(1.5) * 2^96
      sqrtPriceUpperX96: 91442775600000000000000000000n // sqrt(2.0) * 2^96
    };

    const mockResult = [-887220, 887220]; // Example tick values

    (
      mockTickLensContract.instance.getTicksFromPriceRange.staticCall as jest.Mock
    ).mockResolvedValue(mockResult);

    const result = await query.execute(mockParams);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockTickLensContract.instance.getTicksFromPriceRange.staticCall).toHaveBeenCalledWith(
      mockParams.pool,
      mockParams.sqrtPriceLowerX96,
      mockParams.sqrtPriceUpperX96
    );

    expect(result).toEqual({
      tickLower: mockResult[0],
      tickUpper: mockResult[1]
    });
  });

  it('should throw error when get ticks from price range fails', async () => {
    const mockParams = {
      pool: '0x123',
      sqrtPriceLowerX96: 500n,
      sqrtPriceUpperX96: 1000n
    };

    const error = new Error('Failed to get ticks from price range');
    (
      mockTickLensContract.instance.getTicksFromPriceRange.staticCall as jest.Mock
    ).mockRejectedValue(error);

    await expect(query.execute(mockParams)).rejects.toThrow('Failed to get ticks from price range');
  });
});
