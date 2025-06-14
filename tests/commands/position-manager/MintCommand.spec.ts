import { MintCommand } from '@commands/position-manager';
import { PositionManagerContract } from '@contracts';
import { BigNumberish } from 'ethers';

describe('MintCommand', () => {
  let command: MintCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        mint: jest.fn(),
      },
    } as any;

    command = new MintCommand(positionManager);
  });

  it('should execute mint command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (positionManager.instance.mint as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params = {
      token0: '0x123',
      token1: '0x456',
      fee: 3000,
      tickLower: -887220,
      tickUpper: 887220,
      amount0Desired: '1000000',
      amount1Desired: '1000000',
      amount0Min: '0',
      amount1Min: '0',
      recipient: '0x789',
      deadline: Math.floor(Date.now() / 1000) + 3600,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(positionManager.instance.mint).toHaveBeenCalledWith({
      token0: params.token0,
      token1: params.token1,
      fee: params.fee,
      tickLower: params.tickLower,
      tickUpper: params.tickUpper,
      amount0Desired: params.amount0Desired,
      amount1Desired: params.amount1Desired,
      amount0Min: params.amount0Min,
      amount1Min: params.amount1Min,
      recipient: params.recipient,
      deadline: params.deadline,
    });
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during mint execution', async () => {
    const error = new Error('Transaction failed');
    (positionManager.instance.mint as unknown as jest.Mock).mockRejectedValue(error);

    const params = {
      token0: '0x123',
      token1: '0x456',
      fee: 3000,
      tickLower: -887220,
      tickUpper: 887220,
      amount0Desired: '1000000',
      amount1Desired: '1000000',
      amount0Min: '0',
      amount1Min: '0',
      recipient: '0x789',
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