import { InitializePoolCommand } from '@commands/pool';
import { PoolContract } from '@contracts';
import { IInitializeOnlyPoolCommandParams } from '@interfaces/commands/params/IInitializePoolCommandParams';
import { Signer } from 'ethers';

jest.mock('@contracts', () => ({
  PoolContract: jest.fn().mockImplementation(() => ({
    instance: {
      InitializeObservation: jest.fn(),
    },
    setSigner: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('InitializePoolCommand', () => {
  let command: InitializePoolCommand;
  let mockTransaction: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = { hash: '0xHASH', wait: jest.fn().mockResolvedValue({}) };
    command = new InitializePoolCommand();
  });

  it('should execute initialize pool command successfully', async () => {
    const params: IInitializeOnlyPoolCommandParams = {
      poolAddress: '0xPOOL',
      initialPrice: 1000n,
      signer: {} as Signer,
      onDone: jest.fn(),
      onFail: jest.fn(),
      onTransaction: jest.fn(),
    };

    // Cria a instância e captura o mock
    const poolInstance = new PoolContract(params.poolAddress);
    (poolInstance.instance.InitializeObservation as unknown as jest.Mock).mockResolvedValue(mockTransaction);
    (poolInstance.setSigner as jest.Mock).mockResolvedValue(undefined);
    // Garante que o construtor sempre retorna o mesmo mock
    (PoolContract as jest.Mock).mockImplementation(() => poolInstance);

    await command.execute(params);

    expect(poolInstance.setSigner).toHaveBeenCalledWith(params.signer);
    expect(poolInstance.instance.InitializeObservation).toHaveBeenCalledWith(params.initialPrice);
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
  });

  it('should handle errors during initialize pool execution', async () => {
    const error = new Error('Initialize failed');
    const params: IInitializeOnlyPoolCommandParams = {
      poolAddress: '0xPOOL',
      initialPrice: 1000n,
      signer: {} as Signer,
      onDone: jest.fn(),
      onFail: jest.fn(),
      onTransaction: jest.fn(),
    };

    // Cria a instância e captura o mock
    const poolInstance = new PoolContract(params.poolAddress);
    (poolInstance.instance.InitializeObservation as unknown as jest.Mock).mockRejectedValue(error);
    (poolInstance.setSigner as jest.Mock).mockResolvedValue(undefined);
    (PoolContract as jest.Mock).mockImplementation(() => poolInstance);

    await command.execute(params);

    expect(poolInstance.setSigner).toHaveBeenCalledWith(params.signer);
    expect(params.onTransaction).not.toHaveBeenCalled();
    expect(params.onDone).not.toHaveBeenCalled();
    expect(params.onFail).toHaveBeenCalledWith(error);
  });
});
