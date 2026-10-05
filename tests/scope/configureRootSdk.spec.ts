import 'reflect-metadata';
import { Signer } from 'ethers';
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
  configureRootSigner,
  configureRootChain,
  configureRootChainById
} from '../../src/scope/configureRootSdk';
import { ChainName, ChainId } from '@interfaces';

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

describe('configureRootSdk (root container)', () => {
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
      throw new Error(`Unknown contract: ${contractClass}`);
    });
  });

  it('should call setSigner on all writer contracts', async () => {
    await configureRootSigner(fakeSigner);

    expect(mockContractA.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractB.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractC.setSigner).toHaveBeenCalledWith(fakeSigner);
  });

  it('should call setChain on all resolved contracts', async () => {
    await configureRootChain(fakeChain);

    expect(mockContractA.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractB.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractC.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockReader.setChain).toHaveBeenCalledWith(fakeChain);
  });

  it('should call setChain on all resolved contracts using chain ID', async () => {
    const fakeChainId: ChainId = 11155111;
    await configureRootChainById(fakeChainId);

    expect(mockContractA.setChain).toHaveBeenCalledWith('sepolia');
    expect(mockContractB.setChain).toHaveBeenCalledWith('sepolia');
    expect(mockContractC.setChain).toHaveBeenCalledWith('sepolia');
  });
});
