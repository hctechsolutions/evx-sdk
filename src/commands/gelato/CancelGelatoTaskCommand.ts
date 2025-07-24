import { ICancelGelatoTaskCommandParams } from '@interfaces/commands/params/ICancelGelatoTaskCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { GelatoProvider } from '@providers';

/**
 * @title Cancel Gelato Task Command
 * @notice Cancels an automation task on Gelato Network
 * @dev This command interacts with Gelato Network to cancel automated tasks
 */
@injectable()
@singleton()
export class CancelGelatoTaskCommand implements IBaseCommand<ICancelGelatoTaskCommandParams, void> {
  constructor(
    @inject(GelatoProvider)
    private readonly gelatoProvider: GelatoProvider
  ) {}

  /**
   * @notice Executes the cancel Gelato task command
   * @param params The parameters for canceling the task
   */
  async execute(params: ICancelGelatoTaskCommandParams): Promise<void> {
    try {
      // Initialize Gelato provider if not already initialized
      if (!this.gelatoProvider.isInitialized()) {
        const apiKey = params.apiKey || process.env.GELATO_API_KEY;
        if (!apiKey) {
          throw new Error('Gelato API key is required. Set GELATO_API_KEY environment variable or pass apiKey parameter.');
        }

        // Get chain ID based on current chain
        const chainId = this.getChainId();
        await this.gelatoProvider.initialize(apiKey, chainId);
      }

      // Cancel the task
      await this.gelatoProvider.cancelTask(params.taskId);

      params.onDone?.(undefined);
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