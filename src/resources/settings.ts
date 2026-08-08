import {
  BaseContract,
  GovernanceContract,
  PairFlashContract,
  PositionLensContract,
  PositionManagerContract,
  QuoterContract,
  SwapRouterContract,
  TickLensContract
} from '@contracts';
import { ChainName, ChainId } from '@interfaces';
import { FactoryContract } from '@contracts';
import { getChainNameById } from '@utils';
import { container } from 'tsyringe';
import { RPC } from '@providers';
import { Signer } from 'ethers';

/**
 * @notice Gets all writer contracts that need signer and chain updates
 * @dev Resolves from the **root** container — legacy single-consumer (Web).
 *      Multi-request hosts must use {@link createSdkScope} instead.
 * @returns Array of contract instances that need configuration
 */
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
    container.resolve(FactoryContract)
  ];
}

export async function getAllContracts(): Promise<BaseContract[]> {
  return [...getReaderContracts(), ...getWriterContracts()];
}

/**
 * @title Set All Signer
 * @notice Sets the signer for all writer contracts (root / legacy Web)
 * @param signer The signer to use for transactions
 * @deprecated For multi-request backends prefer {@link createSdkScope}
 */
export async function setAllSigner(signer: Signer) {
  await Promise.all(getWriterContracts().map((c: any) => c.setSigner(signer)));
}

/**
 * @title Set All Chain
 * @notice Sets the chain for all contracts on the root container (legacy Web)
 * @param chain The chain to use for contract interactions
 * @deprecated For multi-request backends prefer {@link createSdkScope}
 */
export async function setAllChain(chain: ChainName) {
  const contracts = await getAllContracts();
  await Promise.all(contracts.map((c: BaseContract) => c.setChain(chain)));
}

/**
 * @title Set All Chain by ID
 * @notice Sets the chain for all contracts using chain ID (root / legacy Web)
 * @param chainId The chain ID to use for contract interactions
 * @throws Error if chain ID is not found
 * @deprecated For multi-request backends prefer {@link createSdkScope}
 */
export async function setAllChainById(chainId: ChainId) {
  const chainName = getChainNameById(chainId);
  await setAllChain(chainName);
}

/**
 * @title Set RPC Provider
 * @notice Sets the RPC provider URL on the root container (legacy Web)
 * @param rpcUrl The RPC URL to connect to
 * @deprecated For multi-request backends prefer {@link createSdkScope}
 */
export async function setRPCProvider(rpcUrl: string): Promise<void> {
  const rpc = container.resolve(RPC);
  rpc.setProvider(rpcUrl);
}
