import { UpdateQuorumNumeratorCommand } from '@commands/dao';
import { EvexGovernanceContract } from '@contracts';
import { IUpdateQuorumNumeratorCommandParams } from '@interfaces/commands/params/IUpdateQuorumNumeratorCommandParams';

describe('UpdateQuorumNumeratorCommand', () => {
  let command: UpdateQuorumNumeratorCommand;
  let mockEvexGovernance: jest.Mocked<EvexGovernanceContract>;
  let mockParams: IUpdateQuorumNumeratorCommandParams;

  beforeEach(() => {
    const mockUpdateQuorumNumerator = jest.fn();
    mockEvexGovernance = {
      instance: {
        updateQuorumNumerator: mockUpdateQuorumNumerator,
      },
    } as unknown as jest.Mocked<EvexGovernanceContract>;

    mockParams = {
      newQuorumNumerator: BigInt(1000),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new UpdateQuorumNumeratorCommand(mockEvexGovernance);
  });

  it('should execute updateQuorumNumerator successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvexGovernance.instance.updateQuorumNumerator as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvexGovernance.instance.updateQuorumNumerator).toHaveBeenCalledWith(
      mockParams.newQuorumNumerator
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during updateQuorumNumerator execution', async () => {
    const mockError = new Error('Update quorum numerator failed');
    ((mockEvexGovernance.instance.updateQuorumNumerator as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });
}); 