import { SwapExactOutputCommand } from '@commands/swap';
import { SwapRouterContract } from '@contracts';
import { ISwapExactOutputCommandParams } from '@interfaces/commands/params/ISwapExactOutputCommandParams';

describe('SwapExactOutputCommand', () => {
  let command: SwapExactOutputCommand;
  let mockSwapRouter: jest.Mocked<SwapRouterContract>;
  let mockParams: ISwapExactOutputCommandParams;

  beforeEach(() => {
    const mockExactOutput = jest.fn();
    mockSwapRouter = {
      instance: {
        exactOutput: mockExactOutput,
      },
    } as unknown as jest.Mocked<SwapRouterContract>;

    mockParams = {
      path: '0x1234',
      recipient: '0xRecipient',
      deadline: 1234567890,
      amountOut: BigInt(1000000),
      amountInMaximum: BigInt(1100000),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new SwapExactOutputCommand(mockSwapRouter);
  });

  it('should execute swap exact output successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockSwapRouter.instance.exactOutput as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockSwapRouter.instance.exactOutput).toHaveBeenCalledWith({
      path: mockParams.path,
      recipient: mockParams.recipient,
      deadline: mockParams.deadline,
      amountOut: mockParams.amountOut,
      amountInMaximum: mockParams.amountInMaximum,
    });

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during swap execution', async () => {
    const mockError = new Error('Swap failed');
    ((mockSwapRouter.instance.exactOutput as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 