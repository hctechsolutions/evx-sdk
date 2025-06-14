import { SwapExactInputSingleCommand } from '@commands/swap';
import { SwapRouterContract } from '@contracts';
import { ISwapExactInputSingleCommandParams } from '@interfaces/commands/params/ISwapExactInputSingleCommandParams';

describe('SwapExactInputSingleCommand', () => {
  let command: SwapExactInputSingleCommand;
  let mockSwapRouter: jest.Mocked<SwapRouterContract>;
  let mockParams: ISwapExactInputSingleCommandParams;

  beforeEach(() => {
    const mockExactInputSingle = jest.fn();
    mockSwapRouter = {
      instance: {
        exactInputSingle: mockExactInputSingle,
      },
    } as unknown as jest.Mocked<SwapRouterContract>;

    mockParams = {
      tokenIn: '0xTokenIn',
      tokenOut: '0xTokenOut',
      fee: 3000,
      recipient: '0xRecipient',
      deadline: 1234567890,
      amountIn: BigInt(1000000),
      amountOutMinimum: BigInt(900000),
      sqrtPriceLimitX96: BigInt(0),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new SwapExactInputSingleCommand(mockSwapRouter);
  });

  it('should execute swap exact input single successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockSwapRouter.instance.exactInputSingle as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockSwapRouter.instance.exactInputSingle).toHaveBeenCalledWith({
      tokenIn: mockParams.tokenIn,
      tokenOut: mockParams.tokenOut,
      fee: mockParams.fee,
      recipient: mockParams.recipient,
      deadline: mockParams.deadline,
      amountIn: mockParams.amountIn,
      amountOutMinimum: mockParams.amountOutMinimum,
      sqrtPriceLimitX96: mockParams.sqrtPriceLimitX96,
    });

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during swap execution', async () => {
    const mockError = new Error('Swap failed');
    ((mockSwapRouter.instance.exactInputSingle as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 