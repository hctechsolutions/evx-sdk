import { IExecuteLimitOrderCommandParams } from '@interfaces/commands/params/IExecuteLimitOrderCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';

/**
 * @title Execute Limit Order Command
 * @notice Manually executes a limit order (typically used for testing or emergency execution)
 * @dev This command interacts with the LimitOrderExecutor contract to execute a limit order
 */
@injectable()
@singleton()
export class ExecuteLimitOrderCommand implements IBaseCommand<IExecuteLimitOrderCommandParams, void> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract
  ) {}

  /**
   * @notice Executes the execute limit order command
   * @param params The parameters for executing the limit order
   */
  async execute(params: IExecuteLimitOrderCommandParams): Promise<void> {
    try {
      const transaction = await this.limitOrderExecutor.instance.executeLimitOrder(
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
