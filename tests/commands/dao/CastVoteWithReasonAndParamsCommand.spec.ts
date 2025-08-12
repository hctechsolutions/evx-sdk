import { CastVoteWithReasonAndParamsCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { ICastVoteWithReasonAndParamsCommandParams } from '@interfaces/commands/params/ICastVoteWithReasonAndParamsCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastVoteWithReasonAndParamsCommand', () => {
  let command: CastVoteWithReasonAndParamsCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: ICastVoteWithReasonAndParamsCommandParams;

  beforeEach(() => {
    const mockCastVoteWithReasonAndParams = jest.fn();
    mockEvxGovernance = {
      instance: {
        castVoteWithReasonAndParams: mockCastVoteWithReasonAndParams,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      reason: 'This proposal aligns with our community values',
      params: '0x1234567890abcdef',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastVoteWithReasonAndParamsCommand(mockEvxGovernance);
  });

  it('should execute cast vote with reason and params successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.reason,
      mockParams.params
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast vote with reason and params execution', async () => {
    const mockError = new Error('Cast vote with reason and params failed');
    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle different vote support values with reason and params', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    mockParams.reason = 'This proposal has security concerns';
    mockParams.params = '0xabcdef1234567890';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.reason,
      mockParams.params
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    mockParams.reason = 'Need more information to make a decision';
    mockParams.params = '0x9876543210fedcba';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.reason,
      mockParams.params
    );
  });

  it('should handle empty reason string with params', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    mockParams.reason = '';
    mockParams.params = '0x0000000000000000';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      '',
      '0x0000000000000000'
    );
  });

  it('should handle empty params string', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    mockParams.params = '';
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.reason,
      ''
    );
  });

  it('should handle long reason string with complex params', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const longReason = 'This is a very long reason that explains in detail why this vote is being cast. It includes multiple sentences and provides comprehensive justification for the voting decision. The reason covers various aspects of the proposal including technical considerations, economic impact, and community alignment.';
    const complexParams = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    mockParams.reason = longReason;
    mockParams.params = complexParams;
    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      longReason,
      complexParams
    );
  });

  it('should handle different proposal IDs with reason and params', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.castVoteWithReasonAndParams as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test with different proposal IDs
    const proposalIds = [BigInt(1), BigInt(100), BigInt(999999)];
    
    for (const proposalId of proposalIds) {
      mockParams.proposalId = proposalId;
      mockParams.params = `0x${proposalId.toString(16).padStart(16, '0')}`;
      
      await command.execute(mockParams);

      expect(mockEvxGovernance.instance.castVoteWithReasonAndParams).toHaveBeenCalledWith(
        proposalId,
        VoteSupport.For,
        mockParams.reason,
        mockParams.params
      );
    }
  });
}); 