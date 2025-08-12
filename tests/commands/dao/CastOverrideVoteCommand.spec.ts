import { CastOverrideVoteCommand } from '@commands/dao';
import { GovernanceContract } from '@contracts';
import { ICastOverrideVoteCommandParams } from '@interfaces/commands/params/ICastOverrideVoteCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastOverrideVoteCommand', () => {
  let command: CastOverrideVoteCommand;
  let mockGovernance: jest.Mocked<GovernanceContract>;
  let mockParams: ICastOverrideVoteCommandParams;

  beforeEach(() => {
    const mockCastOverrideVote = jest.fn();
    mockGovernance = {
      instance: {
        castOverrideVote: mockCastOverrideVote
      }
    } as unknown as jest.Mocked<GovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      reason: 'I support this proposal because it aligns with our goals',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    command = new CastOverrideVoteCommand(mockGovernance);
  });

  it('should execute cast override vote successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (mockGovernance.instance.castOverrideVote as unknown as jest.Mock).mockResolvedValue(
      mockTransaction
    );

    await command.execute(mockParams);

    expect(mockGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.reason
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast override vote execution', async () => {
    const mockError = new Error('Cast override vote failed');
    (mockGovernance.instance.castOverrideVote as unknown as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle different vote support values', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (mockGovernance.instance.castOverrideVote as unknown as jest.Mock).mockResolvedValue(
      mockTransaction
    );

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.reason
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.reason
    );
  });
});
