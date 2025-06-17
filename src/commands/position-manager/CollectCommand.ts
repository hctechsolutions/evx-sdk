import { ICollectCommandParams } from '@interfaces/commands/params/ICollectCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Collect Command
 * @notice Collects fees and rewards from a position
 * @dev This command interacts with the PositionManager contract to collect fees
 */
@injectable()
@singleton()
export class CollectCommand implements IBaseCommand<ICollectCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the collect command
   * @param params The parameters for collecting fees
   */
  async execute(params: ICollectCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.collect({
        tokenId: params.tokenId,
        recipient: params.recipient,
        amount0Max: params.amount0Max,
        amount1Max: params.amount1Max
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
