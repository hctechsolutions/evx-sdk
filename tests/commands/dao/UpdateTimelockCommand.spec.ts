import { UpdateTimelockCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { IUpdateTimelockCommandParams } from '@interfaces/commands/params/IUpdateTimelockCommandParams';

describe('UpdateTimelockCommand', () => {
  let command: UpdateTimelockCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: IUpdateTimelockCommandParams;

  beforeEach(() => {
    const mockUpdateTimelock = jest.fn();
    mockEvxGovernance = {
      instance: {
        updateTimelock: mockUpdateTimelock,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      newTimelock: '0xNewTimelockAddress',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new UpdateTimelockCommand(mockEvxGovernance);
  });

  it('should execute updateTimelock successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.updateTimelock as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.updateTimelock).toHaveBeenCalledWith(
      mockParams.newTimelock
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during updateTimelock execution', async () => {
    const mockError = new Error('Update timelock failed');
    ((mockEvxGovernance.instance.updateTimelock as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 