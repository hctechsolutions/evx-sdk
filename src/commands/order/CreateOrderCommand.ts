import { ICreateOrderCommandParams } from '@interfaces/commands/params/ICreateOrderCommandParams';
import { ICreateOrderCommandOutput } from '@interfaces/commands/outputs/ICreateOrderCommandOutput';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { OrderExecutorContract } from '@contracts';

/**
 * @title Create Order Command
 * @notice Creates a new order in the OrderExecutor contract
 * @dev This command interacts with the OrderExecutor contract to create a new order
 */
@injectable()
@singleton()
export class CreateOrderCommand
  implements IBaseCommand<ICreateOrderCommandParams, ICreateOrderCommandOutput>
{
  constructor(
    @inject(OrderExecutorContract)
    private readonly orderExecutor: OrderExecutorContract
  ) {}

  /**
   * @notice Executes the create order command
   * @param params The parameters for creating the order
   * @returns The order ID
   */
  async execute(params: ICreateOrderCommandParams): Promise<ICreateOrderCommandOutput> {
    try {
      const transaction = await this.orderExecutor.instance.createOrder({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee,
        recipient: params.recipient,
        deadline: params.deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      // Get the order ID from the OrderCreated event in the receipt
      const orderCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.orderExecutor.instance.interface.parseLog(log);
          return parsedLog?.name === 'OrderCreated';
        } catch {
          return false;
        }
      });

      if (!orderCreatedEvent) {
        throw new Error('OrderCreated event not found in transaction receipt');
      }

      const parsedEvent = this.orderExecutor.instance.interface.parseLog(orderCreatedEvent);
      if (!parsedEvent) {
        throw new Error('Failed to parse OrderCreated event');
      }

      const orderId = parsedEvent.args.orderId;

      params.onDone?.(receipt);

      return {
        orderId
      };
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }
}
