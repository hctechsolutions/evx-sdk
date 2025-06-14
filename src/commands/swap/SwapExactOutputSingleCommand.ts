import { ISwapExactOutputSingleCommandParams } from '@interfaces/commands/params/ISwapExactOutputSingleCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { SwapRouterContract } from '@contracts';

/**
 * @title Swap Exact Output Single Command
 * @notice Executes a swap with exact output amount for a single hop
 * @dev This command interacts with the SwapRouter contract to execute a single hop swap with exact output
 */
@injectable()
@singleton()
export class SwapExactOutputSingleCommand implements IBaseCommand<ISwapExactOutputSingleCommandParams, void> {
  constructor(
    @inject(SwapRouterContract)
    private readonly swapRouter: SwapRouterContract
  ) {}

  /**
   * @notice Executes the swap exact output single command
   * @param params The parameters for executing the swap
   */
  async execute(params: ISwapExactOutputSingleCommandParams): Promise<void> {
    try {
      const transaction = await this.swapRouter.instance.exactOutputSingle({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee,
        recipient: params.recipient,
        deadline: params.deadline,
        amountOut: params.amountOut,
        amountInMaximum: params.amountInMaximum,
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