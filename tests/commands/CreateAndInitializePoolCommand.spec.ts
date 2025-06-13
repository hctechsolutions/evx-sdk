import { ICreateAndInitializePoolCommandParams } from '@interfaces/commands/params/ICreateAndInitializePoolCommandParams';
import { ICreatePoolCommandOutput } from '@interfaces/commands/outputs/ICreatePoolCommandOutput';
import { CreateAndInitializePoolCommand } from '@commands';
import { PositionManagerContract } from '@contracts';
import { sortTokens } from '@utils';

jest.mock('@utils', () => ({
  sortTokens: jest.fn()
}));

type TxObject = {
  hash: string;
  wait: jest.Mock<Promise<any>, []>;
};

describe('CreateAndInitializePoolCommand', () => {
  let mockPositionManager: Partial<PositionManagerContract>;
  let command: CreateAndInitializePoolCommand;

  beforeEach(() => {
    // Create a mock function for createAndInitializePoolIfNecessary
    const mockedMethod = jest.fn();
    // Attach a staticCall mock to the same function object
    (mockedMethod as any).staticCall = jest.fn();

    // Build the fake PositionManagerContract with only 'instance.createAndInitializePoolIfNecessary'
    mockPositionManager = {
      instance: {
        createAndInitializePoolIfNecessary: mockedMethod
      } as any
    };

    // Instantiate the command with the mocked PositionManagerContract
    command = new CreateAndInitializePoolCommand(
      mockPositionManager as PositionManagerContract
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call staticCall, createAndInitializePoolIfNecessary, and invoke onTransaction/onDone when successful', async () => {
    // Stub sortTokens to return tokens in sorted order
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Fake pool address returned by staticCall.
    const fakePoolAddress = '0xFAKE_POOL_ADDRESS';
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall as jest.Mock).mockResolvedValue(
      fakePoolAddress
    );

    // Prepare a mock transaction with hash and wait().
    const fakeTx: TxObject = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockResolvedValue({ status: 1 })
    };

    // Make createAndInitializePoolIfNecessary return the fakeTx.
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Create spy callbacks.
    const onTransactionSpy = jest.fn<void, [string]>();
    const onDoneSpy = jest.fn<void, [ICreatePoolCommandOutput]>();
    const onFailSpy = jest.fn<void, [any]>();

    // Define input parameters (tokens originally unsorted).
    const params: ICreateAndInitializePoolCommandParams = {
      token0: '0xUNSORTED1',
      token1: '0xUNSORTED2',
      fee: 3000n,
      initialPrice: 123456n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute the command.
    const result = await command.execute(params);

    // Verify sortTokens was called with original tokens.
    expect(sortTokens as jest.Mock).toHaveBeenCalledWith({ token0: '0xUNSORTED1', token1: '0xUNSORTED2' });

    // Verify staticCall was called with sorted tokens, fee, and initialPrice.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall
    ).toHaveBeenCalledTimes(1);
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall
    ).toHaveBeenCalledWith(tokenA, tokenB, params.fee, params.initialPrice);

    // Verify createAndInitializePoolIfNecessary was called with same args.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary
    ).toHaveBeenCalledTimes(1);
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary
    ).toHaveBeenCalledWith(tokenA, tokenB, params.fee, params.initialPrice);

    // Verify onTransaction received the transaction hash.
    expect(onTransactionSpy).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakeTx.hash);

    // Verify transaction.wait() was called.
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);

    // Verify onDone received the expected output.
    expect(onDoneSpy).toHaveBeenCalledTimes(1);
    expect(onDoneSpy).toHaveBeenCalledWith({ pool: fakePoolAddress });

    // Verify the returned result matches the expected output.
    expect(result).toEqual({ pool: fakePoolAddress });

    // onFail should not have been called.
    expect(onFailSpy).not.toHaveBeenCalled();
  });

  it('should invoke onFail and throw if staticCall throws an error', async () => {
    // Stub sortTokens to return tokens as-is.
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Simulate staticCall throwing an error.
    const staticCallError = new Error('staticCall failed');
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall as jest.Mock).mockRejectedValue(
      staticCallError
    );

    // Spies for callbacks.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters.
    const params: ICreateAndInitializePoolCommandParams = {
      token0: '0xUNSORTED1',
      token1: '0xUNSORTED2',
      fee: 500n,
      initialPrice: 9999n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute and expect rejection.
    await expect(command.execute(params)).rejects.toThrow(staticCallError);

    // Verify staticCall was called exactly once.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall
    ).toHaveBeenCalledTimes(1);

    // Neither createAndInitializePoolIfNecessary nor transaction.wait should be called.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary
    ).not.toHaveBeenCalled();

    // onTransaction and onDone should not be called.
    expect(onTransactionSpy).not.toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should have been called with the staticCall error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy).toHaveBeenCalledWith(staticCallError);
  });

  it('should invoke onFail and throw if createAndInitializePoolIfNecessary throws before wait()', async () => {
    // Stub sortTokens to return tokens as-is.
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Make staticCall resolve successfully.
    const fakePoolAddress = '0xFAKE_POOL_ADDRESS';
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall as jest.Mock).mockResolvedValue(
      fakePoolAddress
    );

    // Simulate createAndInitializePoolIfNecessary throwing an error immediately.
    const callError = new Error('createAndInitialize call failed');
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary as unknown as jest.Mock).mockRejectedValue(callError);

    // Spies for callbacks.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters.
    const params: ICreateAndInitializePoolCommandParams = {
      token0: '0xUNSORTED1',
      token1: '0xUNSORTED2',
      fee: 500n,
      initialPrice: 8888n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute and expect rejection.
    await expect(command.execute(params)).rejects.toThrow(callError);

    // staticCall should have been called once.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall
    ).toHaveBeenCalledTimes(1);

    // createAndInitializePoolIfNecessary should have been called once.
    expect(mockPositionManager.instance!.createAndInitializePoolIfNecessary).toHaveBeenCalledTimes(1);

    // transaction.wait should not be called.
    expect(onTransactionSpy).not.toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should have been called with the call error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy).toHaveBeenCalledWith(callError);
  });

  it('should invoke onFail and throw if transaction.wait throws an error', async () => {
    // Stub sortTokens to return tokens as-is.
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Make staticCall resolve successfully.
    const fakePoolAddress = '0xFAKE_POOL_ADDRESS';
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall as jest.Mock).mockResolvedValue(
      fakePoolAddress
    );

    // Prepare a fakeTx whose wait() will reject.
    const fakeTx: TxObject = {
      hash: '0xFAKE_TX_HASH',
      wait: jest.fn().mockRejectedValue(new Error('wait() failed'))
    };
    (mockPositionManager.instance!.createAndInitializePoolIfNecessary as unknown as jest.Mock).mockResolvedValue(fakeTx);

    // Spies for callbacks.
    const onTransactionSpy = jest.fn();
    const onDoneSpy = jest.fn();
    const onFailSpy = jest.fn();

    // Parameters.
    const params: ICreateAndInitializePoolCommandParams = {
      token0: '0xUNSORTED1',
      token1: '0xUNSORTED2',
      fee: 500n,
      initialPrice: 7777n,
      onTransaction: onTransactionSpy,
      onDone: onDoneSpy,
      onFail: onFailSpy
    };

    // Execute and expect rejection.
    await expect(command.execute(params)).rejects.toThrow('wait() failed');

    // staticCall should have been called once.
    expect(
      mockPositionManager.instance!.createAndInitializePoolIfNecessary.staticCall
    ).toHaveBeenCalledTimes(1);

    // createAndInitializePoolIfNecessary should have been called once.
    expect(mockPositionManager.instance!.createAndInitializePoolIfNecessary).toHaveBeenCalledTimes(1);

    // onTransaction should have been called with the transaction hash.
    expect(onTransactionSpy).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakeTx.hash);

    // transaction.wait should have been called.
    expect(fakeTx.wait).toHaveBeenCalledTimes(1);

    // onDone should not be called.
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should have been called with the wait() error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy.mock.calls[0][0].message).toBe('wait() failed');
  });
});
