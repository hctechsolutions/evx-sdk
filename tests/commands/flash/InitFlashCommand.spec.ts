import { InitFlashCommand } from '@commands/flash';
import { PairFlashContract } from '@contracts';
import { IInitFlashCommandParams } from '@interfaces/commands/params/IInitFlashCommandParams';
import { RPC } from '@providers';

jest.mock('@contracts', () => {
  const initFlashMock = jest.fn();
  return {
    PairFlashContract: jest.fn().mockImplementation(() => ({
      instance: {
        initFlash: initFlashMock,
      },
    })),
    __initFlashMock: initFlashMock,
  };
});

const { __initFlashMock } = jest.requireMock('@contracts');

describe('InitFlashCommand', () => {
  let command: InitFlashCommand;
  let pairFlash: any;
  let mockRpc: jest.Mocked<RPC>;

  beforeEach(() => {
    mockRpc = {
      provider: {} as any,
      setProvider: jest.fn(),
    } as any;

    pairFlash = new PairFlashContract(mockRpc);
    command = new InitFlashCommand(pairFlash);
    __initFlashMock.mockReset();
  });

  it('should execute init flash command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    };
    __initFlashMock.mockResolvedValue(mockTransaction);

    const params: IInitFlashCommandParams = {
      token0: '0xToken0',
      token1: '0xToken1',
      fee1: 3000,
      amount0: 1000000n,
      amount1: 1000000n,
      fee2: 3000,
      fee3: 3000,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(__initFlashMock).toHaveBeenCalledWith(params);
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalledWith({ status: 1 });
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during init flash command execution', async () => {
    const error = new Error('Command failed');
    __initFlashMock.mockRejectedValue(error);

    const params: IInitFlashCommandParams = {
      token0: '0xToken0',
      token1: '0xToken1',
      fee1: 3000,
      amount0: 1000000n,
      amount1: 1000000n,
      fee2: 3000,
      fee3: 3000,
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