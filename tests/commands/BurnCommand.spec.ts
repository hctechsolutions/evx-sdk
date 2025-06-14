import { BurnCommand } from '../../src/commands/BurnCommand';
import { PositionManagerContract } from '../../src/contracts';
import { BigNumberish } from 'ethers';

describe('BurnCommand', () => {
  let command: BurnCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;

  beforeEach(() => {
    positionManager = {
      instance: {
        burn: jest.fn(),
      },
    } as any;

    command = new BurnCommand(positionManager);
  });

  it('should execute burn command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (positionManager.instance.burn as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params = {
      tokenId: '1',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(positionManager.instance.burn).toHaveBeenCalledWith(params.tokenId);
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during burn execution', async () => {
    const error = new Error('Transaction failed');
    (positionManager.instance.burn as unknown as jest.Mock).mockRejectedValue(error);

    const params = {
      tokenId: '1',
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