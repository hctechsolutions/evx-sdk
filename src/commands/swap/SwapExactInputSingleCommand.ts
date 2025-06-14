import { ISwapExactInputSingleCommandParams } from '@interfaces/commands/params/ISwapExactInputSingleCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { SwapRouterContract } from '@contracts';

/**
 * @title Swap Exact Input Single Command
 * @notice Executes a swap with exact input amount for a single hop
 * @dev This command interacts with the SwapRouter contract to execute a single hop swap
 */
@injectable()
@singleton()
export class SwapExactInputSingleCommand implements IBaseCommand<ISwapExactInputSingleCommandParams, void> {
  constructor(
    @inject(SwapRouterContract)
    private readonly swapRouter: SwapRouterContract
  ) {}

  /**
   * @notice Executes the swap exact input single command
   * @param params The parameters for executing the swap
   */
  async execute(params: ISwapExactInputSingleCommandParams): Promise<void> {
    try {
      const transaction = await this.swapRouter.instance.exactInputSingle({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee,
        recipient: params.recipient,
        deadline: params.deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96,
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
} 