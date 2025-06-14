import { SwapExactInputCommand } from '@commands/swap';
import { SwapRouterContract } from '@contracts';
import { ISwapExactInputCommandParams } from '@interfaces/commands/params/ISwapExactInputCommandParams';

describe('SwapExactInputCommand', () => {
  let command: SwapExactInputCommand;
  let mockSwapRouter: jest.Mocked<SwapRouterContract>;
  let mockParams: ISwapExactInputCommandParams;

  beforeEach(() => {
    const mockExactInput = jest.fn();
    mockSwapRouter = {
      instance: {
        exactInput: mockExactInput,
      },
    } as unknown as jest.Mocked<SwapRouterContract>;

    mockParams = {
      path: '0x1234',
      recipient: '0xRecipient',
      deadline: 1234567890,
      amountIn: BigInt(1000000),
      amountOutMinimum: BigInt(900000),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new SwapExactInputCommand(mockSwapRouter);
  });

  it('should execute swap exact input successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockSwapRouter.instance.exactInput as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockSwapRouter.instance.exactInput).toHaveBeenCalledWith({
      path: mockParams.path,
      recipient: mockParams.recipient,
      deadline: mockParams.deadline,
      amountIn: mockParams.amountIn,
      amountOutMinimum: mockParams.amountOutMinimum,
    });

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during swap execution', async () => {
    const mockError = new Error('Swap failed');
    ((mockSwapRouter.instance.exactInput as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 