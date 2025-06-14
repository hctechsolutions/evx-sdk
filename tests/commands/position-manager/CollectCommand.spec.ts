import { CollectCommand } from '@commands/position-manager';
import { PositionManagerContract } from '@contracts';
import { BigNumberish } from 'ethers';

describe('CollectCommand', () => {
  let command: CollectCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        collect: jest.fn(),
      },
    } as any;

    command = new CollectCommand(positionManager);
  });

  it('should execute collect command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (positionManager.instance.collect as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params = {
      tokenId: '1',
      recipient: '0x123',
      amount0Max: '1000000',
      amount1Max: '1000000',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(positionManager.instance.collect).toHaveBeenCalledWith({
      tokenId: params.tokenId,
      recipient: params.recipient,
      amount0Max: params.amount0Max,
      amount1Max: params.amount1Max,
    });
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during collect execution', async () => {
    const error = new Error('Transaction failed');
    (positionManager.instance.collect as unknown as jest.Mock).mockRejectedValue(error);

    const params = {
      tokenId: '1',
      recipient: '0x123',
      amount0Max: '1000000',
      amount1Max: '1000000',
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