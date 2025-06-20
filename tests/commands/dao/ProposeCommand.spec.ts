import { ProposeCommand } from '@commands/dao';
import { NebularGovernanceContract } from '@contracts';
import { IProposeCommandParams } from '@interfaces/commands/params/IProposeCommandParams';

describe('ProposeCommand', () => {
  let command: ProposeCommand;
  let mockNebularGovernance: jest.Mocked<NebularGovernanceContract>;
  let mockParams: IProposeCommandParams;

  beforeEach(() => {
    const mockPropose = jest.fn();
    mockNebularGovernance = {
      instance: {
        propose: mockPropose,
      },
    } as unknown as jest.Mocked<NebularGovernanceContract>;

    mockParams = {
      targets: ['0xTarget1', '0xTarget2'],
      values: [BigInt(0), BigInt(1000000)],
      calldatas: ['0xCalldata1', '0xCalldata2'],
      description: 'Test proposal description',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new ProposeCommand(mockNebularGovernance);
  });

  it('should execute propose successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.propose as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockNebularGovernance.instance.propose).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.description
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during propose execution', async () => {
    const mockError = new Error('Propose failed');
    ((mockNebularGovernance.instance.propose as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle single target proposal', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.propose as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const singleTargetParams: IProposeCommandParams = {
      targets: ['0xSingleTarget'],
      values: [BigInt(500000)],
      calldatas: ['0xSingleCalldata'],
      description: 'Single target proposal',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(singleTargetParams);

    expect(mockNebularGovernance.instance.propose).toHaveBeenCalledWith(
      singleTargetParams.targets,
      singleTargetParams.values,
      singleTargetParams.calldatas,
      singleTargetParams.description
    );
  });

  it('should handle empty values array', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockNebularGovernance.instance.propose as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const emptyValuesParams: IProposeCommandParams = {
      targets: ['0xTarget1', '0xTarget2'],
      values: [BigInt(0), BigInt(0)],
      calldatas: ['0xCalldata1', '0xCalldata2'],
      description: 'Proposal with no value transfers',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(emptyValuesParams);

    expect(mockNebularGovernance.instance.propose).toHaveBeenCalledWith(
      emptyValuesParams.targets,
      emptyValuesParams.values,
      emptyValuesParams.calldatas,
      emptyValuesParams.description
    );
  });
}); 