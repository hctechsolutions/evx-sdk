import { CancelCommand } from '@commands/dao';
import { GovernanceContract } from '@contracts';
import { ICancelCommandParams } from '@interfaces/commands/params/ICancelCommandParams';

describe('CancelCommand', () => {
  let command: CancelCommand;
  let mockGovernance: jest.Mocked<GovernanceContract>;
  let mockParams: ICancelCommandParams;

  beforeEach(() => {
    const mockCancel = jest.fn();
    mockGovernance = {
      instance: {
        cancel: mockCancel
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

    command = new CancelCommand(mockGovernance);
  });

  it('should execute cancel successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (mockGovernance.instance.cancel as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockGovernance.instance.cancel).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.descriptionHash
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cancel execution', async () => {
    const mockError = new Error('Cancel failed');
    (mockGovernance.instance.cancel as unknown as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
});
