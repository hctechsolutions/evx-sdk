import { ICreateGelatoTaskCommandParams } from '@interfaces/commands/params/ICreateGelatoTaskCommandParams';
import { IGelatoTaskOutput } from '@interfaces/commands/outputs/IGelatoTaskOutput';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { GelatoProvider } from '@providers';
import { settings } from '@resources';

/**
 * @title Create Gelato Task Command
 * @notice Creates a new automation task on Gelato Network
 * @dev This command interacts with Gelato Network to create automated tasks
 */
@injectable()
@singleton()
export class CreateGelatoTaskCommand implements IBaseCommand<ICreateGelatoTaskCommandParams, IGelatoTaskOutput> {
  constructor(
    @inject(GelatoProvider)
    private readonly gelatoProvider: GelatoProvider
  ) {}

  /**
   * @notice Executes the create Gelato task command
   * @param params The parameters for creating the task
   * @returns The created task information
   */
  async execute(params: ICreateGelatoTaskCommandParams): Promise<IGelatoTaskOutput> {
    try {
      if (!this.gelatoProvider.isInitialized()) {
        const apiKey = params.apiKey || process.env.GELATO_API_KEY;
        if (!apiKey) {
          throw new Error('Gelato API key is required. Set GELATO_API_KEY environment variable or pass apiKey parameter.');
        }

        const chainId = this.getChainId();
        await this.gelatoProvider.initialize(apiKey, chainId);
      }

      const taskId = await this.gelatoProvider.createTask({
        target: params.target,
        data: params.data,
        value: params.value,
        interval: params.interval,
        maxExecutions: params.maxExecutions,
        startTime: params.startTime,
        endTime: params.endTime,
        gasLimit: params.gasLimit || BigInt(settings.gelato.gas.limit),
        maxFeePerGas: params.maxFeePerGas,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        name: params.name
      });

      const taskDetails = await this.gelatoProvider.getTask(taskId);

      const output: IGelatoTaskOutput = {
        taskId: taskId,
        name: taskDetails.name || params.name || 'Evex Limit Order Task',
        target: params.target,
        data: params.data,
        value: params.value || 0n,
        interval: params.interval,
        maxExecutions: params.maxExecutions || 0,
        startTime: params.startTime || Math.floor(Date.now() / 1000),
        endTime: params.endTime || 0,
        gasLimit: params.gasLimit || BigInt(settings.gelato.gas.limit),
        maxFeePerGas: params.maxFeePerGas || settings.gelato.gas.maxFee,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas || settings.gelato.gas.maxPriorityFee,
        status: 'active',
        executions: 0,
        creator: taskDetails.creator || '0x0000000000000000000000000000000000000000',
        createdAt: Math.floor(Date.now() / 1000)
      };

      params.onDone?.(output);
      return output;
    } catch (error: any) {
      params.onFail?.(error);
      throw error;
    }
  }

  /**
   * @notice Get the chain ID for the current network
   * @returns The chain ID
   */
  private getChainId(): number {
    return 11155111; // Sepolia
  }
} 