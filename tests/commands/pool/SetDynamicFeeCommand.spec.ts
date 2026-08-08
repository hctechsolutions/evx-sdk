import { SetDynamicFeeCommand } from '@commands/pool';
import { PoolContract } from '@contracts';
import { ISetDynamicFeeCommandParams } from '@interfaces/commands/params/ISetDynamicFeeCommandParams';
import { Signer } from 'ethers';

jest.mock('@contracts', () => ({
  PoolContract: jest.fn().mockImplementation(() => ({
    instance: {
      setDynamicFee: jest.fn()
    },
    setSigner: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('SetDynamicFeeCommand', () => {
  let command: SetDynamicFeeCommand;

  beforeEach(() => {
    jest.clearAllMocks();
    command = new SetDynamicFeeCommand({} as any);
  });

  it('should execute setDynamicFee successfully', async () => {
    const mockTransaction = {
      hash: '0xFEE',
      wait: jest.fn().mockResolvedValue({ status: 1 })
    };

    const poolInstance = new PoolContract('0xPOOL');
    (poolInstance.instance.setDynamicFee as unknown as jest.Mock).mockResolvedValue(mockTransaction);
    (PoolContract as jest.Mock).mockImplementation(() => poolInstance);

    const params: ISetDynamicFeeCommandParams = {
      poolAddress: '0xPOOL',
      newFee: 3000n,
      signer: {} as Signer,
      onTransaction: jest.fn(),
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    await command.execute(params);

    expect(poolInstance.setSigner).toHaveBeenCalledWith(params.signer);
    expect(poolInstance.instance.setDynamicFee).toHaveBeenCalledWith(params.newFee);
    expect(params.onTransaction).toHaveBeenCalledWith(mockTransaction.hash);
    expect(params.onDone).toHaveBeenCalled();
    expect(params.onFail).not.toHaveBeenCalled();
  });

  it('should invoke onFail when setDynamicFee throws', async () => {
    const error = new Error('ACL revert');
    const poolInstance = new PoolContract('0xPOOL');
    (poolInstance.instance.setDynamicFee as unknown as jest.Mock).mockRejectedValue(error);
    (PoolContract as jest.Mock).mockImplementation(() => poolInstance);

    const params: ISetDynamicFeeCommandParams = {
      poolAddress: '0xPOOL',
      newFee: 5000n,
      signer: {} as Signer,
      onFail: jest.fn()
    };

    await command.execute(params);

    expect(params.onFail).toHaveBeenCalledWith(error);
  });

  it('should invoke onFail when wait returns null receipt', async () => {
    const mockTransaction = {
      hash: '0xFEE',
      wait: jest.fn().mockResolvedValue(null)
    };
    const poolInstance = new PoolContract('0xPOOL');
    (poolInstance.instance.setDynamicFee as unknown as jest.Mock).mockResolvedValue(mockTransaction);
    (PoolContract as jest.Mock).mockImplementation(() => poolInstance);

    const params: ISetDynamicFeeCommandParams = {
      poolAddress: '0xPOOL',
      newFee: 3000n,
      signer: {} as Signer,
      onDone: jest.fn(),
      onFail: jest.fn()
    };

    await command.execute(params);

    expect(params.onDone).not.toHaveBeenCalled();
    expect(params.onFail).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('null transaction receipt') })
    );
  });
});

