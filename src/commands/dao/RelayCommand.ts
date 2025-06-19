import { IRelayCommandParams } from '@interfaces/commands/params/IRelayCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { NebularGovernanceContract } from '@contracts';

/**
 * @title Relay Command
 * @notice Executes a relay operation in governance
 * @dev This command interacts with the NebularGovernance contract to relay calls to other contracts
 */
@injectable()
@singleton()
export class RelayCommand implements IBaseCommand<IRelayCommandParams, void> {
  constructor(
    @inject(NebularGovernanceContract)
    private readonly nebularGovernance: NebularGovernanceContract
  ) {}

  /**
   * @notice Executes the relay command
   * @param params The parameters for executing the relay operation
   */
  async execute(params: IRelayCommandParams): Promise<void> {
    try {
      const transaction = await this.nebularGovernance.instance.relay(
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