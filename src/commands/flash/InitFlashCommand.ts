import { IInitFlashCommandParams } from '@interfaces/commands/params/IInitFlashCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PairFlashContract } from '@contracts';

/**
 * @title Init Flash Command
 * @notice Initializes a flash loan
 * @dev This command interacts with the PairFlash contract to initialize a flash loan
 */
@injectable()
@singleton()
export class InitFlashCommand implements IBaseCommand<IInitFlashCommandParams, void> {
  constructor(
    @inject(PairFlashContract)
    private readonly pairFlash: PairFlashContract
  ) {}

  /**
   * @notice Executes the init flash command
   * @param params The parameters for initializing the flash loan
   */
  async execute(params: IInitFlashCommandParams): Promise<void> {
    try {
      const transaction = await this.pairFlash.instance.initFlash(params);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
