import { IBurnCommandParams } from '@interfaces/commands/params/IBurnCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Burn Command
 * @notice Burns a position and removes all liquidity
 * @dev This command interacts with the PositionManager contract to burn a position
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class BurnCommand implements IBaseCommand<IBurnCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the burn command
   * @param params The parameters for burning a position
   */
  async execute(params: IBurnCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.burn(params.tokenId);

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
