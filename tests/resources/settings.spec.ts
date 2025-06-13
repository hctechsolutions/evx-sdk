import 'reflect-metadata';
import { Signer } from 'ethers';
import { container } from 'tsyringe';
import { PositionManagerContract, FactoryContract } from '@contracts';
import { setAllSigner, setAllChain, ChainName } from '@resources';

// Corrige o mock mantendo os decorators como @singleton funcionando
jest.mock('tsyringe', () => {
  const actual = jest.requireActual('tsyringe');
  return {
    ...actual,
    container: {
      resolve: jest.fn()
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

  beforeEach(() => {
    jest.clearAllMocks();

    (container.resolve as jest.Mock).mockImplementation((contractClass) => {
      if (contractClass === PositionManagerContract) return mockContractA;
      if (contractClass === FactoryContract) return mockContractB;
      throw new Error(`Unknown contract: ${contractClass}`);
    });
  });

  it('should call setSigner on all resolved contracts', async () => {
    await setAllSigner(fakeSigner);

    expect(mockContractA.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractB.setSigner).toHaveBeenCalledWith(fakeSigner);
    expect(mockContractA.setSigner).toHaveBeenCalledTimes(1);
    expect(mockContractB.setSigner).toHaveBeenCalledTimes(1);
  });

  it('should call setChain on all resolved contracts', async () => {
    await setAllChain(fakeChain);

    expect(mockContractA.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractB.setChain).toHaveBeenCalledWith(fakeChain);
    expect(mockContractA.setChain).toHaveBeenCalledTimes(1);
    expect(mockContractB.setChain).toHaveBeenCalledTimes(1);
  });
});
