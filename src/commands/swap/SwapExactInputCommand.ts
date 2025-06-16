import { ISwapExactInputCommandParams } from '@interfaces/commands/params/ISwapExactInputCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { SwapRouterContract } from '@contracts';

/**
 * @title Swap Exact Input Command
 * @notice Executes a swap with exact input amount
 * @dev This command interacts with the SwapRouter contract to execute a swap
 */
@injectable()
@singleton()
export class SwapExactInputCommand implements IBaseCommand<ISwapExactInputCommandParams, void> {
  constructor(
    @inject(SwapRouterContract)
    private readonly swapRouter: SwapRouterContract
  ) {}

  /**
   * @notice Executes the swap exact input command
   * @param params The parameters for executing the swap
   */
  async execute(params: ISwapExactInputCommandParams): Promise<void> {
    try {
      const transaction = await this.swapRouter.instance.exactInput({
        path: params.path,
        recipient: params.recipient,
        deadline: params.deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
