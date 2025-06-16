import { PositionManagerContract } from '@contracts';
import { FactoryContract } from '@contracts';
import { ChainName } from '@resources';
import { container } from 'tsyringe';
import { RPC } from '@providers';
import { Signer } from 'ethers';

/**
 * @notice Gets all writer contracts that need signer and chain updates
 * @returns Array of contract instances that need configuration
 */
function getWriterContracts() {
  return [container.resolve(PositionManagerContract), container.resolve(FactoryContract)];
}

/**
 * @title Set All Signer
 * @notice Sets the signer for all writer contracts
 * @param signer The signer to use for transactions
 */
export async function setAllSigner(signer: Signer) {
  await Promise.all(getWriterContracts().map((c) => c.setSigner(signer)));
}

/**
 * @title Set All Chain
 * @notice Sets the chain for all writer contracts
 * @param chain The chain to use for contract interactions
 */
export async function setAllChain(chain: ChainName) {
  await Promise.all(getWriterContracts().map((c) => c.setChain(chain)));
}

/**
 * @title Set RPC Provider
 * @notice Sets the RPC provider URL for the SDK
 * @param rpcUrl The RPC URL to connect to
 */
export async function setRPCProvider(rpcUrl: string): Promise<void> {
  const rpc = container.resolve(RPC);
  rpc.setProvider(rpcUrl);
}
