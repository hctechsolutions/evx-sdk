import { CastVoteWithReasonAndParamsBySigCommand } from '@commands/dao';
import { GovernanceContract } from '@contracts';
import { ICastVoteWithReasonAndParamsBySigCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonAndParamsBySigCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastVoteWithReasonAndParamsBySigCommand', () => {
  let command: CastVoteWithReasonAndParamsBySigCommand;
  let mockGovernance: jest.Mocked<GovernanceContract>;
  let mockParams: ICastVoteWithReasonAndParamsBySigCommandParams;

  beforeEach(() => {
    const mockCastVoteWithReasonAndParamsBySig = jest.fn();
    mockGovernance = {
      instance: {
        castVoteWithReasonAndParamsBySig: mockCastVoteWithReasonAndParamsBySig
      }
    } as unknown as jest.Mocked<GovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For,
      voter: '0x1234567890abcdef1234567890abcdef12345678',
      reason: 'I support this proposal because it aligns with our goals',
      params: '0xabcdef',
      signature: '0xabcdef',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    command = new CastVoteWithReasonAndParamsBySigCommand(mockGovernance);
  });

  it('should execute cast vote with reason and params by sig successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (
      mockGovernance.instance.castVoteWithReasonAndParamsBySig as unknown as jest.Mock
    ).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      mockParams.reason,
      mockParams.params,
      mockParams.signature
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast vote with reason and params by sig execution', async () => {
    const mockError = new Error('Cast vote with reason and params by sig failed');
    (
      mockGovernance.instance.castVoteWithReasonAndParamsBySig as unknown as jest.Mock
    ).mockRejectedValue(mockError);

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

    (
      mockGovernance.instance.castVoteWithReasonAndParamsBySig as unknown as jest.Mock
    ).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.voter,
      mockParams.reason,
      mockParams.params,
      mockParams.signature
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.voter,
      mockParams.reason,
      mockParams.params,
      mockParams.signature
    );
  });

  it('should handle different parameter types for signature', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (
      mockGovernance.instance.castVoteWithReasonAndParamsBySig as unknown as jest.Mock
    ).mockResolvedValue(mockTransaction);

    // Test with Buffer signature
    mockParams.signature = Buffer.from('abcdef', 'hex');
    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      mockParams.reason,
      mockParams.params,
      mockParams.signature
    );

    // Test with Uint8Array signature
    mockParams.signature = new Uint8Array([0xab, 0xcd, 0xef]);
    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      mockParams.reason,
      mockParams.params,
      mockParams.signature
    );
  });

  it('should handle different reason and params values', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({})
    };

    (
      mockGovernance.instance.castVoteWithReasonAndParamsBySig as unknown as jest.Mock
    ).mockResolvedValue(mockTransaction);

    // Test with different reason
    mockParams.reason = 'This proposal needs more consideration';
    mockParams.params = '0x123456';
    await command.execute(mockParams);

    expect(mockGovernance.instance.castVoteWithReasonAndParamsBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      'This proposal needs more consideration',
      '0x123456',
      mockParams.signature
    );
  });
});
