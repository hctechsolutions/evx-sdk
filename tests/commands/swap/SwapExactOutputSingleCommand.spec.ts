import { SwapExactOutputSingleCommand } from '@commands/swap';
import { SwapRouterContract } from '@contracts';
import { ISwapExactOutputSingleCommandParams } from '@interfaces/commands/params/ISwapExactOutputSingleCommandParams';

describe('SwapExactOutputSingleCommand', () => {
  let command: SwapExactOutputSingleCommand;
  let mockSwapRouter: jest.Mocked<SwapRouterContract>;
  let mockParams: ISwapExactOutputSingleCommandParams;

  beforeEach(() => {
    const mockExactOutputSingle = jest.fn();
    mockSwapRouter = {
      instance: {
        exactOutputSingle: mockExactOutputSingle,
      },
    } as unknown as jest.Mocked<SwapRouterContract>;

    mockParams = {
      tokenIn: '0xTokenIn',
      tokenOut: '0xTokenOut',
      fee: 3000,
      recipient: '0xRecipient',
      deadline: 1234567890,
      amountOut: BigInt(1000000),
      amountInMaximum: BigInt(1100000),
      sqrtPriceLimitX96: BigInt(0),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new SwapExactOutputSingleCommand(mockSwapRouter);
  });

  it('should execute swap exact output single successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockSwapRouter.instance.exactOutputSingle as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockSwapRouter.instance.exactOutputSingle).toHaveBeenCalledWith({
      tokenIn: mockParams.tokenIn,
      tokenOut: mockParams.tokenOut,
      fee: mockParams.fee,
      recipient: mockParams.recipient,
      deadline: mockParams.deadline,
      amountOut: mockParams.amountOut,
      amountInMaximum: mockParams.amountInMaximum,
      sqrtPriceLimitX96: mockParams.sqrtPriceLimitX96,
    });

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during swap execution', async () => {
    const mockError = new Error('Swap failed');
    ((mockSwapRouter.instance.exactOutputSingle as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 