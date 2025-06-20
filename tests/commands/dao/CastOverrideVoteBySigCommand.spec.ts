import { CastOverrideVoteBySigCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { ICastOverrideVoteBySigCommandParams } from '@interfaces/commands/params/ICastOverrideVoteBySigCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastOverrideVoteBySigCommand', () => {
  let command: CastOverrideVoteBySigCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: ICastOverrideVoteBySigCommandParams;

  beforeEach(() => {
    const mockCastOverrideVoteBySig = jest.fn();
    mockNebularGovernance = {
      instance: {
        castOverrideVoteBySig: mockCastOverrideVoteBySig,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For, // For
      voter: '0x1234567890123456789012345678901234567890',
      reason: 'I support this proposal because it aligns with our goals',
      signature: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastOverrideVoteBySigCommand(mockNebularGovernance);
  });

  it('should execute cast override vote by signature successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.castOverrideVoteBySig as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      mockParams.reason,
      mockParams.signature
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast override vote by signature execution', async () => {
    const mockError = new Error('Cast override vote by signature failed');
    ((mockNebularGovernance.instance.castOverrideVoteBySig as unknown) as jest.Mock).mockRejectedValue(mockError);

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

    ((mockNebularGovernance.instance.castOverrideVoteBySig as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.voter,
      mockParams.reason,
      mockParams.signature
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.voter,
      mockParams.reason,
      mockParams.signature
    );
  });

  it('should handle different voter addresses and signatures', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.castOverrideVoteBySig as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test with different voter address
    mockParams.voter = '0x9876543210987654321098765432109876543210';
    mockParams.signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castOverrideVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      '0x9876543210987654321098765432109876543210',
      mockParams.reason,
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    );
  });
}); 