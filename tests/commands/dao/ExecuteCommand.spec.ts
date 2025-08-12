import { ExecuteCommand } from '@commands/dao';
import { GovernanceContract } from '@contracts';
import { IExecuteCommandParams } from '@interfaces/commands/params/IExecuteCommandParams';

describe('ExecuteCommand', () => {
  let command: ExecuteCommand;
  let mockGovernance: jest.Mocked<GovernanceContract>;
  let mockParams: IExecuteCommandParams;

  beforeEach(() => {
    const mockExecute = jest.fn();
    mockGovernance = {
      instance: {
        execute: mockExecute
      }
    } as unknown as jest.Mocked<GovernanceContract>;

    mockParams = {
      targets: ['0xTarget1', '0xTarget2'],
      values: [BigInt(0), BigInt(1000000)],
      calldatas: ['0xCalldata1', '0xCalldata2'],
      descriptionHash: '0xDescriptionHash',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    command = new ExecuteCommand(mockGovernance);
  });

  it('should execute governance proposal successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (mockGovernance.instance.execute as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockGovernance.instance.execute).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.descriptionHash
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during execute execution', async () => {
    const mockError = new Error('Execute failed');
    (mockGovernance.instance.execute as unknown as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
});
