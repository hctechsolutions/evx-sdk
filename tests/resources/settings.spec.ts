import 'reflect-metadata';
import { JsonRpcProvider, Signer } from 'ethers';
import { container } from 'tsyringe';
import {
  PositionManagerContract,
  FactoryContract,
  SwapRouterContract,
  GovernanceContract,
  PairFlashContract,
  PositionLensContract,
  QuoterContract,
  TickLensContract,
  AirdropDistributorContract
} from '@contracts';
import {
  setAllSigner,
  setAllChain,
  setAllChainById,
  setRPCProvider
} from '@resources';
import { ChainName, ChainId } from '@interfaces';
import { RPC } from '@providers';

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
  const fakeChain: ChainName = 'sepolia';

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

  const mockReader = {
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
      if (contractClass === SwapRouterContract) return mockContractC;
      if (
        contractClass === GovernanceContract ||
        contractClass === PairFlashContract ||
        contractClass === PositionLensContract ||
        contractClass === QuoterContract ||
        contractClass === TickLensContract ||
        contractClass === AirdropDistributorContract
      ) {
        return mockReader;
      }
      if (contractClass === RPC) return mockRPC;
      throw new Error(`Unknown contract: ${contractClass}`);
    });
  });

  it('should call setSigner on all resolved contracts', async () => {
    await setAllSigner(fakeSigner);

    expect(mockContractA.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractB.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractC.setSigner).toHaveBeenCalledWith(fakeSigner);
  });

  it('should call setChain on all resolved contracts', async () => {
    await setAllChain(fakeChain);

    expect(mockContractA.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractB.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractC.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockReader.setChain).toHaveBeenCalledWith(fakeChain);
  });

  it('should call setChain on all resolved contracts using chain ID', async () => {
    const fakeChainId: ChainId = 11155111;
    await setAllChainById(fakeChainId);

    expect(mockContractA.setChain).toHaveBeenCalledWith('sepolia');
    expect(mockContractB.setChain).toHaveBeenCalledWith('sepolia');
    expect(mockContractC.setChain).toHaveBeenCalledWith('sepolia');
  });

  it('should set the RPC provider with the given URL', async () => {
    const rpcUrl = 'https://test-rpc-url';
    await setRPCProvider(rpcUrl);

    expect(mockRPC.setProvider).toHaveBeenCalledWith(rpcUrl);
  });
});
