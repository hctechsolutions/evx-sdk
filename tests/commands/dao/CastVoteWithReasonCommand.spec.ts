import { CastVoteWithReasonCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { ICastVoteWithReasonCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastVoteWithReasonCommand', () => {
  let command: CastVoteWithReasonCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: ICastVoteWithReasonCommandParams;

  beforeEach(() => {
    const mockCastVoteWithReason = jest.fn();
    mockEvxGovernance = {
      instance: {
        castVoteWithReason: mockCastVoteWithReason,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      reason: 'This proposal aligns with our community values',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastVoteWithReasonCommand(mockEvxGovernance);
  });

  it('should execute cast vote with reason successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReason as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReason).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.reason
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast vote with reason execution', async () => {
    const mockError = new Error('Cast vote with reason failed');
    ((mockEvxGovernance.instance.castVoteWithReason as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle different vote support values with reason', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReason as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    mockParams.reason = 'This proposal has security concerns';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReason).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.reason
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    mockParams.reason = 'Need more information to make a decision';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReason).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.reason
    );
  });

  it('should handle empty reason string', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReason as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    mockParams.reason = '';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReason).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      ''
    );
  });

  it('should handle long reason string', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReason as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const longReason = 'This is a very long reason that explains in detail why this vote is being cast. It includes multiple sentences and provides comprehensive justification for the voting decision. The reason covers various aspects of the proposal including technical considerations, economic impact, and community alignment.';
    mockParams.reason = longReason;
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReason).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      longReason
    );
  });
}); 