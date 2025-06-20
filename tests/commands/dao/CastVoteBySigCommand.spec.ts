import { CastVoteBySigCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { ICastVoteBySigCommandParams } from '@interfaces/commands/params/ICastVoteBySigCommandParams';
import { VoteSupport } from '@enums/VoteSupport';

describe('CastVoteBySigCommand', () => {
  let command: CastVoteBySigCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: ICastVoteBySigCommandParams;

  beforeEach(() => {
    const mockCastVoteBySig = jest.fn();
    mockNebularGovernance = {
      instance: {
        castVoteBySig: mockCastVoteBySig,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      proposalId: BigInt(1),
      support: VoteSupport.For,
      voter: '0x1234567890abcdef1234567890abcdef12345678',
      signature: '0xabcdef',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new CastVoteBySigCommand(mockNebularGovernance);
  });

  it('should execute cast vote by sig successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.castVoteBySig as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.For,
      mockParams.voter,
      mockParams.signature
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during cast vote by sig execution', async () => {
    const mockError = new Error('Cast vote by sig failed');
    ((mockNebularGovernance.instance.castVoteBySig as unknown) as jest.Mock).mockRejectedValue(mockError);

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

    ((mockNebularGovernance.instance.castVoteBySig as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    // Test against vote
    mockParams.support = VoteSupport.Against;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Against,
      mockParams.voter,
      mockParams.signature
    );

    // Test abstain vote
    mockParams.support = VoteSupport.Abstain;
    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.castVoteBySig).toHaveBeenCalledWith(
      mockParams.proposalId,
      VoteSupport.Abstain,
      mockParams.voter,
      mockParams.signature
    );
  });
}); 