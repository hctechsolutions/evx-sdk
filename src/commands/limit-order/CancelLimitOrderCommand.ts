import { ICancelLimitOrderCommandParams } from '@interfaces/commands/params/ICancelLimitOrderCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';

/**
 * @title Cancel Limit Order Command
 * @notice Cancels an existing limit order
 * @dev This command interacts with the LimitOrderExecutor contract to cancel a limit order
 */
@injectable()
@singleton()
export class CancelLimitOrderCommand implements IBaseCommand<ICancelLimitOrderCommandParams, void> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the cancel limit order command
   * @param params The parameters for cancelling the limit order
   */
  async execute(params: ICancelLimitOrderCommandParams): Promise<void> {
    try {
      const transaction = await this.limitOrderExecutor.instance.cancelLimitOrder(
        params.orderId
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
