import { UpdateTimelockCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { IUpdateTimelockCommandParams } from '@interfaces/commands/params/IUpdateTimelockCommandParams';

describe('UpdateTimelockCommand', () => {
  let command: UpdateTimelockCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: IUpdateTimelockCommandParams;

  beforeEach(() => {
    const mockUpdateTimelock = jest.fn();
    mockNebularGovernance = {
      instance: {
        updateTimelock: mockUpdateTimelock,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      newTimelock: '0xNewTimelockAddress',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new UpdateTimelockCommand(mockNebularGovernance);
  });

  it('should execute updateTimelock successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.updateTimelock as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.updateTimelock).toHaveBeenCalledWith(
      mockParams.newTimelock
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during updateTimelock execution', async () => {
    const mockError = new Error('Update timelock failed');
    ((mockNebularGovernance.instance.updateTimelock as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 