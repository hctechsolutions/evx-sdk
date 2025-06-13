import { IInitializeOnlyPoolCommandParams } from '@interfaces/commands/params/IInitializePoolCommandParams';
import { InitializePoolCommand } from '@commands';
import { TransactionReceipt, Signer } from 'ethers';
import { PoolContract } from '@contracts';

jest.mock('@contracts', () => ({
  PoolContract: jest.fn()
}));

type TxObject = {
  hash: string;
  wait: jest.Mock<Promise<TransactionReceipt>, []>;
};

describe('InitializePoolCommand', () => {
  let command: InitializePoolCommand;
  let mockPoolInstance: any;
  let mockTx: TxObject;
  let setSignerMock: jest.Mock;

  const mockSigner = {} as Signer;

  beforeEach(() => {
    jest.resetModules();

    mockTx = {
      hash: '0xMOCK_TX_HASH',
      wait: jest.fn()
    };

    setSignerMock = jest.fn();

    mockPoolInstance = {
      InitializeObservation: jest.fn()
    };

    (PoolContract as jest.Mock).mockImplementation(() => ({
      setSigner: setSignerMock,
      instance: mockPoolInstance
    }));

    command = new InitializePoolCommand();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call setSigner, InitializeObservation and invoke onTransaction/onDone when successful', async () => {
    mockPoolInstance.InitializeObservation.mockResolvedValue(mockTx);
    mockTx.wait.mockResolvedValue({ status: 1 } as TransactionReceipt);

    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    const params: IInitializeOnlyPoolCommandParams = {
      poolAddress: '0xPOOL_ADDRESS',
      initialPrice: 123n,
      signer: mockSigner,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    await command.execute(params);

    expect(PoolContract).toHaveBeenCalledWith(params.poolAddress);
    expect(setSignerMock).toHaveBeenCalledWith(mockSigner);
    expect(mockPoolInstance.InitializeObservation).toHaveBeenCalledWith(params.initialPrice);
    expect(onTransactionSpy).toHaveBeenCalledWith(mockTx.hash);
    expect(mockTx.wait).toHaveBeenCalledTimes(1);
    expect(onDoneSpy).toHaveBeenCalledWith({ status: 1 });
    expect(onFailSpy).not.toHaveBeenCalled();
  });

  it('should call onFail if InitializeObservation throws', async () => {
    const error = new Error('Initialization failed');
    mockPoolInstance.InitializeObservation.mockRejectedValue(error);

    const onFailSpy = jest.fn();

    const params: IInitializeOnlyPoolCommandParams = {
      poolAddress: '0xPOOL_ADDRESS',
      initialPrice: 456n,
      signer: mockSigner,
      onFail: onFailSpy
    };

    await command.execute(params);

    expect(setSignerMock).toHaveBeenCalledWith(mockSigner);
    expect(mockPoolInstance.InitializeObservation).toHaveBeenCalledWith(params.initialPrice);
    expect(onFailSpy).toHaveBeenCalledWith(error);
  });

  it('should call onFail if wait() throws', async () => {
    mockPoolInstance.InitializeObservation.mockResolvedValue(mockTx);
    const waitError = new Error('wait() failed');
    mockTx.wait.mockRejectedValue(waitError);

    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    const params: IInitializeOnlyPoolCommandParams = {
      poolAddress: '0xPOOL_ADDRESS',
      initialPrice: 789n,
      signer: mockSigner,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    await command.execute(params);

    expect(setSignerMock).toHaveBeenCalledWith(mockSigner);
    expect(mockPoolInstance.InitializeObservation).toHaveBeenCalledWith(params.initialPrice);
    expect(onTransactionSpy).toHaveBeenCalledWith(mockTx.hash);
    expect(mockTx.wait).toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();
    expect(onFailSpy).toHaveBeenCalledWith(waitError);
  });
});
