import { ICancelOrderCommandParams } from '@interfaces/commands/params/ICancelOrderCommandParams';
import { ICancelOrderCommandOutput } from '@interfaces/commands/outputs/ICancelOrderCommandOutput';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { OrderExecutorContract } from '@contracts';

/**
 * @title Cancel Order Command
 * @notice Cancels an existing order in the OrderExecutor contract
 * @dev This command interacts with the OrderExecutor contract to cancel an order
 */
@injectable()
@singleton()
export class CancelOrderCommand
  implements IBaseCommand<ICancelOrderCommandParams, ICancelOrderCommandOutput>
{
  constructor(
    @inject(OrderExecutorContract)
    private readonly orderExecutor: OrderExecutorContract
  ) {}

  /**
   * @notice Executes the cancel order command
   * @param params The parameters for canceling the order
   * @returns Confirmation that the order was cancelled
   */
  async execute(params: ICancelOrderCommandParams): Promise<ICancelOrderCommandOutput> {
    try {
      const transaction = await this.orderExecutor.instance.cancelOrder(params.orderId);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);

      return {
        cancelled: true
      };
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }
}
