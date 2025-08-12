import { QueueCommand } from '@commands/dao';
import { EvxGovernanceContract } from '@contracts';
import { IQueueCommandParams } from '@interfaces/commands/params/IQueueCommandParams';

describe('QueueCommand', () => {
  let command: QueueCommand;
  let mockEvxGovernance: jest.Mocked<EvxGovernanceContract>;
  let mockParams: IQueueCommandParams;

  beforeEach(() => {
    const mockQueue = jest.fn();
    mockEvxGovernance = {
      instance: {
        queue: mockQueue,
      },
    } as unknown as jest.Mocked<EvxGovernanceContract>;

    mockParams = {
      targets: ['0xTarget1', '0xTarget2'],
      values: [BigInt(0), BigInt(1000000)],
      calldatas: ['0xCalldata1', '0xCalldata2'],
      descriptionHash: '0xDescriptionHash',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    command = new QueueCommand(mockEvxGovernance);
  });

  it('should execute queue successfully', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.queue as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    await command.execute(mockParams);

    expect(mockEvxGovernance.instance.queue).toHaveBeenCalledWith(
      mockParams.targets,
      mockParams.values,
      mockParams.calldatas,
      mockParams.descriptionHash
    );

    expect(mockParams.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(mockParams.onDone).toHaveBeenCalled();
    expect(mockParams.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during queue execution', async () => {
    const mockError = new Error('Queue failed');
    ((mockEvxGovernance.instance.queue as unknown) as jest.Mock).mockRejectedValue(mockError);

    await command.execute(mockParams);

    expect(mockParams.onTransaction).not.toHaveBeenCalled();
    expect(mockParams.onDone).not.toHaveBeenCalled();
    expect(mockParams.onFail).toHaveBeenCalledWith(mockError);
  });

  it('should handle single target queue', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.queue as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const singleTargetParams: IQueueCommandParams = {
      targets: ['0xSingleTarget'],
      values: [BigInt(500000)],
      calldatas: ['0xSingleCalldata'],
      descriptionHash: '0xSingleDescriptionHash',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(singleTargetParams);

    expect(mockEvxGovernance.instance.queue).toHaveBeenCalledWith(
      singleTargetParams.targets,
      singleTargetParams.values,
      singleTargetParams.calldatas,
      singleTargetParams.descriptionHash
    );
  });

  it('should handle empty values array', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.queue as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const emptyValuesParams: IQueueCommandParams = {
      targets: ['0xTarget1', '0xTarget2'],
      values: [BigInt(0), BigInt(0)],
      calldatas: ['0xCalldata1', '0xCalldata2'],
      descriptionHash: '0xEmptyValuesDescriptionHash',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(emptyValuesParams);

    expect(mockEvxGovernance.instance.queue).toHaveBeenCalledWith(
      emptyValuesParams.targets,
      emptyValuesParams.values,
      emptyValuesParams.calldatas,
      emptyValuesParams.descriptionHash
    );
  });

  it('should handle different description hash formats', async () => {
    const mockTransaction = {
      hash: '0xTransactionHash',
      wait: jest.fn().mockResolvedValue({}),
    };

    ((mockEvxGovernance.instance.queue as unknown) as jest.Mock).mockResolvedValue(mockTransaction);

    const differentHashParams: IQueueCommandParams = {
      targets: ['0xTarget1'],
      values: [BigInt(1000000)],
      calldatas: ['0xCalldata1'],
      descriptionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(differentHashParams);

    expect(mockEvxGovernance.instance.queue).toHaveBeenCalledWith(
      differentHashParams.targets,
      differentHashParams.values,
      differentHashParams.calldatas,
      differentHashParams.descriptionHash
    );
  });
}); 