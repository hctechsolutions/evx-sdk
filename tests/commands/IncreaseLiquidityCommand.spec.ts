import { IncreaseLiquidityCommand } from '../../src/commands/IncreaseLiquidityCommand';
import { PositionManagerContract } from '../../src/contracts';
import { BigNumberish } from 'ethers';

describe('IncreaseLiquidityCommand', () => {
  let command: IncreaseLiquidityCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        increaseLiquidity: jest.fn(),
      },
    } as any;

    command = new IncreaseLiquidityCommand(positionManager);
  });

  it('should execute increaseLiquidity command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (positionManager.instance.increaseLiquidity as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params = {
      tokenId: '1',
      amount0Desired: '1000000000000000000',
      amount1Desired: '1000000000000000000',
      amount0Min: '900000000000000000',
      amount1Min: '900000000000000000',
      deadline: Math.floor(Date.now() / 1000) + 3600,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(positionManager.instance.increaseLiquidity).toHaveBeenCalledWith({
      tokenId: params.tokenId,
      amount0Desired: params.amount0Desired,
      amount1Desired: params.amount1Desired,
      amount0Min: params.amount0Min,
      amount1Min: params.amount1Min,
      deadline: params.deadline,
    });
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during increaseLiquidity execution', async () => {
    const error = new Error('Transaction failed');
    (positionManager.instance.increaseLiquidity as unknown as jest.Mock).mockRejectedValue(error);

    const params = {
      tokenId: '1',
      amount0Desired: '1000000000000000000',
      amount1Desired: '1000000000000000000',
      amount0Min: '900000000000000000',
      amount1Min: '900000000000000000',
      deadline: Math.floor(Date.now() / 1000) + 3600,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(params.onTransaction).not.toHaveBeenCalled();
    expect(params.onDone).not.toHaveBeenCalled();
    expect(params.onFail).toHaveBeenCalledWith(error);
  });
}); 