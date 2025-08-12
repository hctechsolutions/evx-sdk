import { CastVoteCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { ICastVoteCommandParams } from '@interfaces/commands/params/ICastVoteCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastVoteCommand', () => {
  let command: CastVoteCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: ICastVoteCommandParams;

  beforeEach(() => {
    const mockCastVote = jest.fn();
    mockEvxGovernance = {
      instance: {
        castVote: mockCastVote,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastVoteCommand(mockEvxGovernance);
  });

  it('should execute cast vote successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVote as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast vote execution', async () => {
    const mockError = new Error('Cast vote failed');
    ((mockEvxGovernance.instance.castVote as unknown) as jest.Mock).mockRejectedValue(mockError);

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

    ((mockEvxGovernance.instance.castVote as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVote).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain
    );
  });
}); 