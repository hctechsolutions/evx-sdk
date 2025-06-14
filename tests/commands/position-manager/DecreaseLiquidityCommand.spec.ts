import { DecreaseLiquidityCommand } from '@commands/position-manager';
import { PositionManagerContract } from '@contracts';

describe('DecreaseLiquidityCommand', () => {
  let command: DecreaseLiquidityCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        decreaseLiquidity: jest.fn(),
      },
    } as any;

    command = new DecreaseLiquidityCommand(positionManager);
  });

  it('should execute decrease liquidity command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (positionManager.instance.decreaseLiquidity as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params = {
      tokenId: '1',
      liquidity: '1000000',
      amount0Min: '0',
      amount1Min: '0',
      deadline: Math.floor(Date.now() / 1000) + 3600,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(positionManager.instance.decreaseLiquidity).toHaveBeenCalledWith({
      tokenId: params.tokenId,
      liquidity: params.liquidity,
      amount0Min: params.amount0Min,
      amount1Min: params.amount1Min,
      deadline: params.deadline,
    });
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during decrease liquidity execution', async () => {
    const error = new Error('Transaction failed');
    (positionManager.instance.decreaseLiquidity as unknown as jest.Mock).mockRejectedValue(error);

    const params = {
      tokenId: '1',
      liquidity: '1000000',
      amount0Min: '0',
      amount1Min: '0',
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