import { CastOverrideVoteCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { ICastOverrideVoteCommandParams } from '@interfaces/commands/params/ICastOverrideVoteCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastOverrideVoteCommand', () => {
  let command: CastOverrideVoteCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: ICastOverrideVoteCommandParams;

  beforeEach(() => {
    const mockCastOverrideVote = jest.fn();
    mockNebularGovernance = {
      instance: {
        castOverrideVote: mockCastOverrideVote,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      reason: 'I support this proposal because it aligns with our goals',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastOverrideVoteCommand(mockNebularGovernance);
  });

  it('should execute cast override vote successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.castOverrideVote as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
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
    ((mockNebularGovernance.instance.castOverrideVote as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle different vote support values', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.castOverrideVote as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.reason
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.reason
    );
  });
}); 