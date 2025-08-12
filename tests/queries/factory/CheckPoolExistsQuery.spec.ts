import { CheckPoolExistsQuery } from '@queries/factory/CheckPoolExistsQuery';
import { RPC } from '@providers';
import { FactoryContract } from '@contracts';
import { container } from 'tsyringe';

jest.mock('@contracts');
jest.mock('@providers');

describe('CheckPoolExistsQuery', () => {
  let query: CheckPoolExistsQuery;
  let mockRPC: jest.Mocked<RPC>;
  let mockFactoryContract: jest.Mocked<FactoryContract>;

  beforeEach(() => {
    container.clearInstances();

    mockRPC = {
      provider: {} as any,
      getProvider: jest.fn(),
      getSigner: jest.fn()
    } as any;

    const staticCallMock = jest.fn();
    mockFactoryContract = {
      instance: {
        getPool: {
          staticCall: staticCallMock
        }
      }
    } as any;

    container.registerInstance(RPC, mockRPC);
    container.registerInstance(FactoryContract, mockFactoryContract);
    query = container.resolve(CheckPoolExistsQuery);
  });

  it('should return true when pool exists', async () => {
    const mockParams = {
      token0: '0x1234567890123456789012345678901234567890',
      token1: '0x0987654321098765432109876543210987654321',
      fee: 3000n
    };

    const mockPoolAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
    (mockFactoryContract.instance.getPool.staticCall as jest.Mock).mockResolvedValue(
      mockPoolAddress
    );

    const result = await query.execute(mockParams);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockFactoryContract.instance.getPool.staticCall).toHaveBeenCalledWith(
      mockParams.token0,
      mockParams.token1,
      mockParams.fee
    );

    expect(result).toEqual({
      exists: true,
      poolAddress: mockPoolAddress
    });
  });

  it('should return false when pool does not exist', async () => {
    const mockParams = {
      token0: '0x1234567890123456789012345678901234567890',
      token1: '0x0987654321098765432109876543210987654321',
      fee: 3000n
    };

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    (mockFactoryContract.instance.getPool.staticCall as jest.Mock).mockResolvedValue(zeroAddress);

    const result = await query.execute(mockParams);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockFactoryContract.instance.getPool.staticCall).toHaveBeenCalledWith(
      mockParams.token0,
      mockParams.token1,
      mockParams.fee
    );

    expect(result).toEqual({
      exists: false,
      poolAddress: zeroAddress
    });
  });

  it('should throw error when getPool fails', async () => {
    const mockParams = {
      token0: '0x1234567890123456789012345678901234567890',
      token1: '0x0987654321098765432109876543210987654321',
      fee: 3000n
    };

    const error = new Error('Failed to get pool');
    (mockFactoryContract.instance.getPool.staticCall as jest.Mock).mockRejectedValue(error);

    await expect(query.execute(mockParams)).rejects.toThrow('Failed to get pool');
  });
});
