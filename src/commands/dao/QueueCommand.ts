import { IQueueCommandParams } from '@interfaces/commands/params/IQueueCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { GovernanceContract } from '@contracts';

/**
 * @title Queue Command
 * @notice Executes a queue operation on a governance proposal
 * @dev This command interacts with the Governance contract to queue a proposal for execution
 */
@injectable()
@singleton()
export class QueueCommand implements IBaseCommand<IQueueCommandParams, void> {
  constructor(
    @inject(GovernanceContract)
    private readonly governance: GovernanceContract
  ) {}

  /**
   * @notice Executes the queue command
   * @param params The parameters for executing the queue operation
   */
  async execute(params: IQueueCommandParams): Promise<void> {
    try {
      const transaction = await this.governance.instance.queue(
        params.targets,
        params.values,
        params.calldatas,
        params.descriptionHash
      );

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
}
