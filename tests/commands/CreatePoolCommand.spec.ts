import { ICreatePoolCommandParams } from '@interfaces/commands/params/ICreatePoolCommandParams';
import { CreatePoolCommand } from '@commands';
import { FactoryContract } from '@contracts';

// Jest automatically mocks classes; here we instantiate a fake factory manually.
type TxObject = {
  hash: string;
  wait: jest.Mock<Promise<any>, []>;
};

describe('CreatePoolCommand', () => {
  let mockFactory: Partial<FactoryContract>;
  let command: CreatePoolCommand;

  beforeEach(() => {
    // Create a mocked factory with only the `instance.createPool` method.
    // Casting is necessary because BaseContract defines `instance: ethers.Contract`.
    mockFactory = {
      instance: {
        createPool: jest.fn()
      } as any
    };

    // Instantiate CreatePoolCommand using the mocked factory.
    command = new CreatePoolCommand(mockFactory as FactoryContract);
  });

  it('should call createPool and invoke onTransaction/onDone when successful', async () => {
    // Prepare a mock transaction with hash and wait().
    const fakeTx: TxObject = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xFAKE_TX_HASH',
      })
    };

    // Make createPool return the fakeTx.
    (mockFactory.instance!.createPool as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Create spy callbacks.
    const onTransactionSpy = jest.fn<void, [string]>();
    const onDoneSpy = jest.fn<void, [any]>();
    const onFailSpy = jest.fn<void, [any]>();

    // Define input parameters.
    const params: ICreatePoolCommandParams = {
      token0: '0xToken0Address',
      token1: '0xToken1Address',
      fee: 3000n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute the command.
    await command.execute(params);

    // Verify createPool was called correctly.
    expect(mockFactory.instance!.createPool).toHaveBeenCalledTimes(1);
    expect(mockFactory.instance!.createPool).toHaveBeenCalledWith(
      params.token0,
      params.token1,
      params.fee
    );

    // Verify onTransaction received the hash.
    expect(onTransactionSpy).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakeTx.hash);

    // Verify tx.wait() was called and onDone received the receipt.
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);
    expect(onDoneSpy).toHaveBeenCalledTimes(1);
    expect(onDoneSpy).toHaveBeenCalledWith({
      status: 1,
      transactionHash: '0xFAKE_TX_HASH'
    });

    // onFail should not have been called.
    expect(onFailSpy).not.toHaveBeenCalled();
  });

  it('should invoke onFail when createPool throws an error', async () => {
    // Simulate createPool throwing an error.
    const creationError = new Error('Error creating pool');
    (mockFactory.instance!.createPool as unknown as jest.Mock).mockRejectedValue(creationError);

    // Spies for callbacks.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters with callbacks.
    const params: ICreatePoolCommandParams = {
      token0: '0xTokenA',
      token1: '0xTokenB',
      fee: 500n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute (should not throw, just call onFail).
    await command.execute(params);

    // createPool should have been invoked.
    expect(mockFactory.instance!.createPool).toHaveBeenCalledTimes(1);

    // No success callbacks should have been called.
    expect(onTransactionSpy).not.toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should be called with the error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy).toHaveBeenCalledWith(creationError);
  });

  it('should invoke onFail when transaction.wait throws an error', async () => {
    // Prepare a fakeTx whose wait() will be rejected.
    const fakeTx: TxObject = {
      hash: '0xANOTHER_TX',
      wait: jest.fn().mockRejectedValue(new Error('Error in wait()'))
    };
    (mockFactory.instance!.createPool as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Spies.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters.
    const params: ICreatePoolCommandParams = {
      token0: '0xTokenX',
      token1: '0xTokenY',
      fee: 1000n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute.
    await command.execute(params);

    // createPool and onTransaction should still occur.
    expect(mockFactory.instance!.createPool).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakeTx.hash);
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);

    // As wait() rejected, onDone should not be called.
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should be called with the wait() error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy.mock.calls[0][0].message).toBe('Error in wait()');
  });

  it('should not throw if no callbacks are provided', async () => {
    // Prepare a fakeTx that resolves successfully.
    const fakeTx: TxObject = {
      hash: '0xNO_CALLBACKS',
      wait: jest.fn().mockResolvedValue({ status: 1 })
    };
    (mockFactory.instance!.createPool as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Parameters without optional callbacks.
    const params: ICreatePoolCommandParams = {
      token0: '0xA',
      token1: '0xB',
      fee: 200n
      // onTransaction, onDone, and onFail are undefined
    };

    // Execute without expecting exceptions.
    await expect(command.execute(params)).resolves.not.toThrow();

    // Ensure createPool was called once.
    expect(mockFactory.instance!.createPool).toHaveBeenCalledTimes(1);
    // Verify that wait() was also called.
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);
  });
});
