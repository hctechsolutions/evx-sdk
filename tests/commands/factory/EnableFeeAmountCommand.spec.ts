import { EnableFeeAmountCommand } from '@commands/factory';
import { FactoryContract } from '@contracts';
import { IEnableFeeAmountCommandParams } from '@interfaces/commands/params/IEnableFeeAmountCommandParams';

// Jest automatically mocks classes; here we instantiate a fake factory manually.
type TxObject = {
  hash: string;
  wait: jest.Mock<Promise<any>, []>;
};

describe('EnableFeeAmountCommand', () => {
  let command: EnableFeeAmountCommand;
  let factory: jest.Mocked<FactoryContract>;

  beforeEach(() => {
    factory = {
      instance: {
        enableFeeAmount: jest.fn(),
      },
    } as any;

    command = new EnableFeeAmountCommand(factory);
  });

  it('should execute enable fee amount command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({}),
    };

    (factory.instance.enableFeeAmount as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(3000),
      tickSpacing: BigInt(60),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(factory.instance.enableFeeAmount).toHaveBeenCalledWith(
      params.fee,
      params.tickSpacing
    );
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should handle errors during enable fee amount execution', async () => {
    const error = new Error('Transaction failed');
    (factory.instance.enableFeeAmount as unknown as jest.Mock).mockRejectedValue(error);

    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(3000),
      tickSpacing: BigInt(60),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await command.execute(params);

    expect(params.onTransaction).not.toHaveBeenCalled();
    expect(params.onDone).not.toHaveBeenCalled();
    expect(params.onFail).toHaveBeenCalledWith(error);
  });

  it('should call enableFeeAmount and invoke onTransaction/onDone when successful', async () => {
    // Prepare a mock transaction with hash and wait().
    const fakeTx: TxObject = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xFAKE_TX_HASH',
      })
    };

    // Make enableFeeAmount return the fakeTx.
    (factory.instance!.enableFeeAmount as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Create spy callbacks.
    const onTransactionSpy = jest.fn<void, [string]>();
    const onDoneSpy = jest.fn<void, [any]>();
    const onFailSpy = jest.fn<void, [any]>();

    // Define input parameters.
    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(500),
      tickSpacing: BigInt(10),
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute the command.
    await command.execute(params);

    // Verify enableFeeAmount was called correctly.
    expect(factory.instance!.enableFeeAmount).toHaveBeenCalledTimes(1);
    expect(factory.instance!.enableFeeAmount).toHaveBeenCalledWith(
      params.fee,
      params.tickSpacing
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

  it('should invoke onFail when enableFeeAmount throws an error', async () => {
    // Simulate enableFeeAmount throwing an error.
    const enableError = new Error('Error enabling fee amount');
    (factory.instance!.enableFeeAmount as unknown as jest.Mock).mockRejectedValue(enableError);

    // Spies for callbacks.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters with callbacks.
    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(10000),
      tickSpacing: BigInt(200),
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute (should not throw, just call onFail).
    await command.execute(params);

    // enableFeeAmount should have been invoked.
    expect(factory.instance!.enableFeeAmount).toHaveBeenCalledTimes(1);

    // No success callbacks should have been called.
    expect(onTransactionSpy).not.toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should be called with the error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy).toHaveBeenCalledWith(enableError);
  });

  it('should invoke onFail when transaction.wait throws an error', async () => {
    // Prepare a fakeTx whose wait() will be rejected.
    const fakeTx: TxObject = {
      hash: '0xANOTHER_TX',
      wait: jest.fn().mockRejectedValue(new Error('Error in wait()'))
    };
    (factory.instance!.enableFeeAmount as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Spies.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters.
    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(3000),
      tickSpacing: BigInt(60),
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute.
    await command.execute(params);

    // enableFeeAmount and onTransaction should still occur.
    expect(factory.instance!.enableFeeAmount).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakeTx.hash);
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);

    // As wait() rejected, onDone should not be called.
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should be called with the wait() error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy).toHaveBeenCalledWith(new Error('Error in wait()'));
  });

  it('should work with different fee amounts and tick spacings', async () => {
    const mockTransaction = {
      hash: '0x456',
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    };

    (factory.instance.enableFeeAmount as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const testCases = [
      { fee: BigInt(500), tickSpacing: BigInt(10) },
      { fee: BigInt(3000), tickSpacing: BigInt(60) },
      { fee: BigInt(10000), tickSpacing: BigInt(200) },
    ];

    for (const testCase of testCases) {
      const params: IEnableFeeAmountCommandParams = {
        fee: testCase.fee,
        tickSpacing: testCase.tickSpacing,
        onTransaction: jest.fn(),
        onDone: jest.fn(),
        onFail: jest.fn(),
      };

      await command.execute(params);

      expect(factory.instance.enableFeeAmount).toHaveBeenCalledWith(
        testCase.fee,
        testCase.tickSpacing
      );
    }
  });

  it('should handle optional callbacks gracefully', async () => {
    const mockTransaction = {
      hash: '0x789',
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    };

    (factory.instance.enableFeeAmount as unknown as jest.Mock).mockResolvedValue(mockTransaction);

    const params: IEnableFeeAmountCommandParams = {
      fee: BigInt(3000),
      tickSpacing: BigInt(60),
      // No callbacks provided
    };

    // Should not throw
    await expect(command.execute(params)).resolves.not.toThrow();

    expect(factory.instance.enableFeeAmount).toHaveBeenCalledWith(
      params.fee,
      params.tickSpacing
    );
  });
}); 