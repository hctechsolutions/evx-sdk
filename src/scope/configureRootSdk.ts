import {
  BaseContract,
  GovernanceContract,
  PairFlashContract,
  PositionLensContract,
  PositionManagerContract,
  QuoterContract,
  SwapRouterContract,
  TickLensContract,
  AirdropDistributorContract,
  FactoryContract
} from '@contracts';
import { ChainName, ChainId } from '@interfaces';
import { getChainNameById } from '@utils';
import { container } from 'tsyringe';
import { Signer } from 'ethers';

function getWriterContracts() {
  return [
    container.resolve(PositionManagerContract),
    container.resolve(FactoryContract),
    container.resolve(SwapRouterContract)
  ];
}

function getReaderContracts() {
  return [
    container.resolve(GovernanceContract),
    container.resolve(PairFlashContract),
    container.resolve(PositionLensContract),
    container.resolve(QuoterContract),
    container.resolve(TickLensContract),
    container.resolve(FactoryContract),
    container.resolve(AirdropDistributorContract)
  ];
}

function getAllContracts(): BaseContract[] {
  return [...getReaderContracts(), ...getWriterContracts()];
}

/**
 * Sets the signer on writer contracts in the **root** DI container.
 * For single-tab browser hosts (Evx Web tx builders). Multi-request backends
 * must use {@link createSdkScope} instead.
 */
export async function configureRootSigner(signer: Signer) {
  await Promise.all(getWriterContracts().map((c: BaseContract) => c.setSigner(signer)));
}

/**
 * Sets the active chain on all contracts in the **root** container.
 * For single-tab browser hosts. Multi-request backends use {@link createSdkScope}.
 */
export async function configureRootChain(chain: ChainName) {
  const contracts = getAllContracts();
  await Promise.all(contracts.map((c: BaseContract) => c.setChain(chain)));
}

/**
 * Sets the active chain by chain ID on the **root** container.
 * @throws Error if chain ID is not supported
 */
export async function configureRootChainById(chainId: ChainId) {
  const chainName = getChainNameById(chainId);
  await configureRootChain(chainName);
}
