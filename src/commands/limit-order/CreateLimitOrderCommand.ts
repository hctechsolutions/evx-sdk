import { ICreateLimitOrderCommandParams } from '@interfaces/commands/params/ICreateLimitOrderCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';

/**
 * @title Create Limit Order Command
 * @notice Creates a new automated limit order with Gelato Network integration
 * @dev This command interacts with the LimitOrderExecutor contract to create a limit order
 */
@injectable()
@singleton()
export class CreateLimitOrderCommand implements IBaseCommand<ICreateLimitOrderCommandParams, string> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the create limit order command
   * @param params The parameters for creating the limit order
   * @returns Promise resolving to the order ID
   */
  async execute(params: ICreateLimitOrderCommandParams): Promise<string> {
    try {
      const gelatoFee = params.gelatoFee || 0n;
      
      const transaction = await this.limitOrderExecutor.instance.createLimitOrder(
        params.limitOrderParams,
        { value: gelatoFee }
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      // Extract the orderId from the LimitOrderCreated event
      const limitOrderCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = this.limitOrderExecutor.instance.interface.parseLog(log);
          return decoded?.name === 'LimitOrderCreated';
        } catch {
          return false;
        }
      });

      if (!limitOrderCreatedEvent) {
        throw new Error('LimitOrderCreated event not found in transaction receipt');
      }

      const decoded = this.limitOrderExecutor.instance.interface.parseLog(limitOrderCreatedEvent);
      const orderId = decoded?.args?.orderId;

      params.onDone?.(receipt);
      return orderId;
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }
}
