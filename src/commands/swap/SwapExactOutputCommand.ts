import { ISwapExactOutputCommandParams } from '@interfaces/commands/params/ISwapExactOutputCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { SwapRouterContract } from '@contracts';

/**
 * @title Swap Exact Output Command
 * @notice Executes a swap with exact output amount
 * @dev This command interacts with the SwapRouter contract to execute a swap with exact output
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class SwapExactOutputCommand implements IBaseCommand<ISwapExactOutputCommandParams, void> {
  constructor(
    @inject(SwapRouterContract)
    private readonly swapRouter: SwapRouterContract
  ) {}

  /**
   * @notice Executes the swap exact output command
   * @param params The parameters for executing the swap
   */
  async execute(params: ISwapExactOutputCommandParams): Promise<void> {
    try {
      const transaction = await this.swapRouter.instance.exactOutput({
        path: params.path,
        recipient: params.recipient,
        deadline: params.deadline,
        amountOut: params.amountOut,
        amountInMaximum: params.amountInMaximum
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
