import { ICreateLimitOrderCommandParams } from '@interfaces/commands/params/ICreateLimitOrderCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { LimitOrderExecutorContract } from '@contracts';
import { CreateGelatoTaskCommand } from '@commands/gelato/CreateGelatoTaskCommand';
import { settings } from '@resources';

/**
 * @title Create Limit Order Command
 * @notice Creates a new automated limit order with Gelato Network integration
 * @dev This command interacts with the LimitOrderExecutor contract to create a limit order and sets up Gelato automation
 */
@injectable()
@singleton()
export class CreateLimitOrderCommand implements IBaseCommand<ICreateLimitOrderCommandParams, string> {
  constructor(
    @inject(LimitOrderExecutorContract)
    private readonly limitOrderExecutor: LimitOrderExecutorContract,
    @inject(CreateGelatoTaskCommand)
    private readonly createGelatoTask: CreateGelatoTaskCommand
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
      const taskId = decoded?.args?.taskId;

      if (!taskId || taskId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        await this.createGelatoAutomation(orderId, params);
      }

      params.onDone?.(receipt);
      return orderId;
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }

  /**
   * @notice Creates a Gelato automation task for the limit order
   * @param orderId The order ID
   * @param params The original command parameters
   */
  private async createGelatoAutomation(orderId: string, params: ICreateLimitOrderCommandParams): Promise<void> {
    try {
      const calldata = this.limitOrderExecutor.instance.interface.encodeFunctionData(
        'executeLimitOrder',
        [orderId]
      );

      await this.createGelatoTask.execute({
        target: this.limitOrderExecutor.getAddress(),
        data: calldata,
        value: 0n,
        interval: settings.gelato.task.interval,
        maxExecutions: 1, 
        gasLimit: BigInt(settings.gelato.gas.limit),
        maxFeePerGas: settings.gelato.gas.maxFee,
        maxPriorityFeePerGas: settings.gelato.gas.maxPriorityFee,
        name: `Limit Order ${orderId}`,
        apiKey: params.gelatoApiKey,
        onDone: (taskOutput) => {
          console.log(`Gelato task created for order ${orderId}: ${taskOutput.taskId}`);
        },
        onFail: (error) => {
          console.error(`Failed to create Gelato task for order ${orderId}:`, error);
        }
      });
    } catch (error) {
      console.error(`Failed to create Gelato automation for order ${orderId}:`, error);
    }
  }
}
