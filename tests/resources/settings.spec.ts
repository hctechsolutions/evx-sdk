import 'reflect-metadata';
import { JsonRpcProvider, Signer } from 'ethers';
import { container } from 'tsyringe';
import { PositionManagerContract, FactoryContract, OrderExecutorContract } from '@contracts';
import { setAllSigner, setAllChain, ChainName, setRPCProvider } from '@resources';
import { RPC } from '@providers';

// Corrige o mock mantendo os decorators como @singleton funcionando
jest.mock('tsyringe', () => {
  const actual = jest.requireActual('tsyringe');
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
      registerInstance: jest.fn()
    }
  };
});

describe('writer contract setters with dynamic resolution', () => {
  const fakeSigner = {} as Signer;
  const fakeChain: ChainName = 'mainnet';

  const mockContractA = {
    setSigner: jest.fn(),
    setChain: jest.fn()
  };

  const mockContractB = {
    setSigner: jest.fn(),
    setChain: jest.fn()
  };

  const mockContractC = {
    setSigner: jest.fn(),
    setChain: jest.fn()
  };

  const mockRPC = {
    provider: null as JsonRpcProvider | null,
    setProvider: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (container.resolve as jest.Mock).mockImplementation((contractClass) => {
      if (contractClass === PositionManagerContract) return mockContractA;
      if (contractClass === FactoryContract) return mockContractB;
      if (contractClass === OrderExecutorContract) return mockContractC;
      throw new Error(`Unknown contract: ${contractClass}`);
    });
  });

  it('should call setSigner on all resolved contracts', async () => {
    await setAllSigner(fakeSigner);

    expect(mockContractA.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractB.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractC.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractA.setSigner).toHaveBeenCalledTimes(1);
    expect(mockContractB.setSigner).toHaveBeenCalledTimes(1);
    expect(mockContractC.setSigner).toHaveBeenCalledTimes(1);
  });

  it('should call setChain on all resolved contracts', async () => {
    await setAllChain(fakeChain);

    expect(mockContractA.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractB.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractC.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractA.setChain).toHaveBeenCalledTimes(1);
    expect(mockContractB.setChain).toHaveBeenCalledTimes(1);
    expect(mockContractC.setChain).toHaveBeenCalledTimes(1);
  });

  it('should set the RPC provider with the given URL', async () => {
    (container.resolve as jest.Mock).mockImplementation((contractClass) => {
      if (contractClass === RPC) return mockRPC;
      throw new Error(`Unknown contract: ${contractClass}`);
    });

    const rpcUrl = 'https://test-rpc-url';
    await setRPCProvider(rpcUrl);

    expect(mockRPC.setProvider).toHaveBeenCalledWith(rpcUrl);
  });
});
