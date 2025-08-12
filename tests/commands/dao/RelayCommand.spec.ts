import { RelayCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { IRelayCommandParams } from '@interfaces/commands/params/IRelayCommandParams';

describe('RelayCommand', () => {
  let command: RelayCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: IRelayCommandParams;

  beforeEach(() => {
    const mockRelay = jest.fn();
    mockEvxGovernance = {
      instance: {
        relay: mockRelay,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      target: '0xTargetAddress',
      value: BigInt(1000000),
      data: '0xCalldata',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new RelayCommand(mockEvxGovernance);
  });

  it('should execute relay successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.relay as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.relay).toHaveBeenCalledWith(
      mockParams.target,
      mockParams.value,
      mockParams.data,
      { value: mockParams.value }
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during relay execution', async () => {
    const mockError = new Error('Relay failed');
    ((mockEvxGovernance.instance.relay as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 