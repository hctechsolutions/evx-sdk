import { ICreateAndInitializePoolCommandParams } from '@interfaces/commands/params/ICreateAndInitializePoolCommandParams';
import { ICreatePoolCommandOutput } from '@interfaces/commands/outputs/ICreatePoolCommandOutput';
import { CreateAndInitializePoolCommand } from '@commands/factory';
import { PositionManagerContract } from '@contracts';
import { sortTokens } from '@utils';
import { RPC } from '@providers';

jest.mock('@utils', () => ({
  sortTokens: jest.fn()
}));

jest.mock('@providers', () => ({
  RPC: jest.fn().mockImplementation(() => ({
    provider: {
      getNetwork: jest.fn(),
    },
  })),
}));

jest.mock('@contracts', () => ({
  PositionManagerContract: jest.fn().mockImplementation(() => ({
    instance: {
      createAndInitializePoolIfNecessary: jest.fn(),
    },
  })),
}));

interface MockMethod extends jest.Mock {
  staticCall: jest.Mock;
}

describe('CreateAndInitializePoolCommand', () => {
  let command: CreateAndInitializePoolCommand;
  let positionManager: jest.Mocked<PositionManagerContract>;
  let rpc: jest.Mocked<RPC>;

  beforeEach(() => {
    jest.clearAllMocks();
    rpc = new RPC() as jest.Mocked<RPC>;
    positionManager = new PositionManagerContract(rpc) as jest.Mocked<PositionManagerContract>;
    command = new CreateAndInitializePoolCommand(positionManager);
  });

  it('should execute create and initialize pool command successfully', async () => {
    const mockTransaction = {
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    };

    const mockPoolAddress = '0xFAKE_POOL_ADDRESS';
    const mockMethod = jest.fn().mockResolvedValue(mockTransaction) as MockMethod;
    mockMethod.staticCall = jest.fn().mockResolvedValue(mockPoolAddress);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;
    (sortTokens as jest.Mock).mockReturnValue({ token0: '0x123', token1: '0x456' });

    const params = {
      token0: '0x123',
      token1: '0x456',
      fee: BigInt(3000),
      initialPrice: BigInt('1000000000000000000'),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    const result = await command.execute(params);

    expect(sortTokens).toHaveBeenCalledWith({ token0: params.token0, token1: params.token1 });
    expect(mockMethod.staticCall).toHaveBeenCalledWith(
      '0x123',
      '0x456',
      params.fee,
      params.initialPrice
    );
    expect(mockMethod).toHaveBeenCalledWith(
      '0x123',
      '0x456',
      params.fee,
      params.initialPrice
    );
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalledWith({ pool: mockPoolAddress });
    expect(params.onFail).not.toHaveBeenCalled();
    expect(result).toEqual({ pool: mockPoolAddress });
  });

  it('should handle errors during create and initialize pool execution', async () => {
    const error = new Error('Transaction failed');
    const mockMethod = jest.fn() as MockMethod;
    mockMethod.staticCall = jest.fn().mockRejectedValue(error);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;
    (sortTokens as jest.Mock).mockReturnValue({ token0: '0x123', token1: '0x456' });

    const params = {
      token0: '0x123',
      token1: '0x456',
      fee: BigInt(3000),
      initialPrice: BigInt('1000000000000000000'),
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn(),
    };

    await expect(command.execute(params)).rejects.toThrow(error);

    expect(params.onTransaction).not.toHaveBeenCalled();
    expect(params.onDone).not.toHaveBeenCalled();
    expect(params.onFail).toHaveBeenCalledWith(error);
  });

  it('should call staticCall, createAndInitializePoolIfNecessary, and invoke onTransaction/onDone when successful', async () => {
    // Stub sortTokens to return tokens in sorted order
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Fake pool address returned by staticCall.
    const fakePoolAddress = '0xFAKE_POOL_ADDRESS';
    const mockMethod = jest.fn().mockResolvedValue({
      hash: fakePoolAddress,
      wait: jest.fn().mockResolvedValue({ status: 1 })
    }) as MockMethod;
    mockMethod.staticCall = jest.fn().mockResolvedValue(fakePoolAddress);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;

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
    expect(mockMethod.staticCall).toHaveBeenCalledTimes(1);
    expect(mockMethod.staticCall).toHaveBeenCalledWith(
      tokenA,
      tokenB,
      params.fee,
      params.initialPrice
    );

    // Verify onTransaction received the transaction hash.
    expect(onTransactionSpy).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakePoolAddress);

    // Pegue a transação retornada pelo mock e verifique wait
    const transaction = await mockMethod.mock.results[0].value;
    expect(transaction.wait).toHaveBeenCalledTimes(1);

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
    const mockMethod = jest.fn() as MockMethod;
    mockMethod.staticCall = jest.fn().mockRejectedValue(staticCallError);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;

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
    expect(mockMethod.staticCall).toHaveBeenCalledTimes(1);

    // Neither createAndInitializePoolIfNecessary nor transaction.wait should be called.
    expect(mockMethod.staticCall).toHaveBeenCalledWith(
      tokenA,
      tokenB,
      params.fee,
      params.initialPrice
    );

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
    const mockMethod = jest.fn().mockRejectedValue(new Error('createAndInitialize call failed')) as MockMethod;
    mockMethod.staticCall = jest.fn().mockResolvedValue(fakePoolAddress);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;

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
    await expect(command.execute(params)).rejects.toThrow('createAndInitialize call failed');

    // staticCall should have been called once.
    expect(mockMethod.staticCall).toHaveBeenCalledTimes(1);

    // createAndInitializePoolIfNecessary should have been called once.
    expect(mockMethod).toHaveBeenCalledWith(
      tokenA,
      tokenB,
      params.fee,
      params.initialPrice
    );

    // transaction.wait should not be called.
    expect(onTransactionSpy).not.toHaveBeenCalled();
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should have been called with the call error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy.mock.calls[0][0].message).toBe('createAndInitialize call failed');
  });

  it('should invoke onFail and throw if transaction.wait throws an error', async () => {
    // Stub sortTokens to return tokens as-is.
    const tokenA = '0xTokenA';
    const tokenB = '0xTokenB';
    (sortTokens as jest.Mock).mockReturnValue({ token0: tokenA, token1: tokenB });

    // Make staticCall resolve successfully.
    const fakePoolAddress = '0xFAKE_POOL_ADDRESS';
    const mockMethod = jest.fn().mockResolvedValue({
      hash: fakePoolAddress,
      wait: jest.fn().mockRejectedValue(new Error('wait() failed'))
    }) as MockMethod;
    mockMethod.staticCall = jest.fn().mockResolvedValue(fakePoolAddress);

    (positionManager.instance.createAndInitializePoolIfNecessary as unknown as MockMethod) = mockMethod;

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
    expect(mockMethod.staticCall).toHaveBeenCalledTimes(1);

    // createAndInitializePoolIfNecessary should have been called once.
    expect(mockMethod).toHaveBeenCalledWith(
      tokenA,
      tokenB,
      params.fee,
      params.initialPrice
    );

    // onTransaction should have been called with the transaction hash.
    expect(onTransactionSpy).toHaveBeenCalledTimes(1);
    expect(onTransactionSpy).toHaveBeenCalledWith(fakePoolAddress);

    // Pegue a transação retornada pelo mock e verifique wait
    const transaction = await mockMethod.mock.results[0].value;
    expect(transaction.wait).toHaveBeenCalledTimes(1);

    // onDone should not be called.
    expect(onDoneSpy).not.toHaveBeenCalled();

    // onFail should have been called with the wait() error.
    expect(onFailSpy).toHaveBeenCalledTimes(1);
    expect(onFailSpy.mock.calls[0][0].message).toBe('wait() failed');
  });
});
