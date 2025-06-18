import { HashProposalCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { IHashProposalCommandParams } from '@interfaces/commands/params/IHashProposalCommandParams';

describe('HashProposalCommand', () => {
  let command: HashProposalCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: IHashProposalCommandParams;

  beforeEach(() => {
    const mockHashProposal = jest.fn();
    mockNebularGovernance = {
      instance: {
        hashProposal: mockHashProposal,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      targets: ['0x1234567890123456789012345678901234567890'],
      values: [BigInt(0)],
      calldatas: ['0x'],
      descriptionHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new HashProposalCommand(mockNebularGovernance);
  });

  it('should execute hash proposal successfully', async () => {
    const mockProposalId = BigInt(123456789);
    ((mockNebularGovernance.instance.hashProposal as unknown) as jest.Mock).mockResolvedValue(mockProposalId);

    const result = await command.execute(mockParams);

    expect(mockNebularGovernance.instance.hashProposal).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.descriptionHash
    );

    expect(result).toBe(mockProposalId);
    expect(mockParams.onDone).toHaveBeenCalledWith(mockProposalId);
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during hash proposal execution', async () => {
    const mockError = new Error('Hash proposal failed');
    ((mockNebularGovernance.instance.hashProposal as unknown) as jest.Mock).mockRejectedValue(mockError);

    await expect(command.execute(mockParams)).rejects.toThrow('Hash proposal failed');

    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle multiple targets and values', async () => {
    const mockProposalId = BigInt(987654321);
    ((mockNebularGovernance.instance.hashProposal as unknown) as jest.Mock).mockResolvedValue(mockProposalId);

    mockParams.targets = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321'
    ];
    mockParams.values = [BigInt(0), BigInt(1000000)];
    mockParams.calldatas = ['0x', '0x12345678'];

    const result = await command.execute(mockParams);

    expect(mockNebularGovernance.instance.hashProposal).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.descriptionHash
    );

    expect(result).toBe(mockProposalId);
  });
}); 