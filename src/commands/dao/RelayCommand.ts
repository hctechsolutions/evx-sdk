import { IRelayCommandParams } from '@interfaces/commands/params/IRelayCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Relay Command
 * @notice Executes a relay operation in governance
 * @dev This command interacts with the Governance contract to relay calls to other contracts
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class RelayCommand implements IBaseCommand<IRelayCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the relay command
   * @param params The parameters for executing the relay operation
   */
  async execute(params: IRelayCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.relay(
        params.target,
        params.value,
        params.data,
        { value: params.value }
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
