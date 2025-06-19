import { IEnableFeeAmountCommandParams } from '@interfaces/commands/params/IEnableFeeAmountCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { FactoryContract } from '@contracts';

/**
 * @title Enable Fee Amount Command
 * @notice Enables a fee amount with its corresponding tick spacing
 * @dev This command interacts with the Factory contract to enable a fee amount
 */
@injectable()
@singleton()
export class EnableFeeAmountCommand implements IBaseCommand<IEnableFeeAmountCommandParams, void> {
  constructor(
    @inject(FactoryContract)
    private readonly factory: FactoryContract
  ) {}

  /**
   * @notice Executes the enable fee amount command
   * @param params The parameters for enabling the fee amount
   */
  async execute(params: IEnableFeeAmountCommandParams): Promise<void> {
    try {
      const transaction = await this.factory.instance.enableFeeAmount(
        params.fee,
        params.tickSpacing
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
} 