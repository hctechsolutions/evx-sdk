import {
  BaseContract,
  AirdropDistributorContract,
  FactoryContract,
  GovernanceContract,
  PairFlashContract,
  PositionLensContract,
  PositionManagerContract,
  QuoterContract,
  SwapRouterContract,
  TickLensContract
} from '@contracts';
import { ChainId, ChainName } from '@interfaces';
import { RPC } from '@providers';
import {
  getChainNameById,
  isValidChainId
} from '../utils/chains';
import {
  DependencyContainer,
  InjectionToken,
  container
} from 'tsyringe';

/**
 * Options for {@link createSdkScope}.
 * Isolates provider + chain for multi-request / multi-chain hosts (AD-21).
 */
export type SdkScopeOptions = {
  rpcUrl: string;
  chainId: ChainId;
};

/**
 * Isolated SDK execution scope: own RPC, contracts, and DI subtree.
 * Prefer this in Nest / multi-request backends.
 *
 * Legacy Web single-tab bootstrap (`setRPCProvider` / `setAllChain`) remains
 * on the root container and must not be used under concurrency.
 */
export type SdkScope = {
  chainId: ChainId;
  chainName: ChainName;
  container: DependencyContainer;
  rpc: RPC;
  resolve: <T>(token: InjectionToken<T>) => T;
  dispose: () => void;
};

function resolveScopeContracts(scope: DependencyContainer): BaseContract[] {
  const writers = [
    scope.resolve(PositionManagerContract),
    scope.resolve(FactoryContract),
    scope.resolve(SwapRouterContract)
  ];
  const readers = [
    scope.resolve(GovernanceContract),
    scope.resolve(PairFlashContract),
    scope.resolve(PositionLensContract),
    scope.resolve(QuoterContract),
    scope.resolve(TickLensContract),
    scope.resolve(FactoryContract),
    scope.resolve(AirdropDistributorContract)
  ];
  return [...readers, ...writers];
}

/**
 * @title Create SDK Scope
 * @notice Creates an isolated DI scope with its own RPC provider and chain
 * @dev Uses tsyringe child container + ContainerScoped lifecycle. Does not
 *      mutate root `setRPCProvider` / `setAllChain` state.
 * @param options rpcUrl + chainId (must be a Supported Network from chains.ts)
 * @returns Disposable scope with resolve() for Commands/Queries
 */
export function createSdkScope(options: SdkScopeOptions): SdkScope {
  if (!isValidChainId(options.chainId)) {
    throw new Error(`Unsupported chainId: ${options.chainId}`);
  }

  const rpcUrl = options.rpcUrl?.trim();
  if (!rpcUrl) {
    throw new Error('rpcUrl is required');
  }

  const chainName = getChainNameById(options.chainId);
  const scopeContainer = container.createChildContainer();
  let rpc: RPC | undefined;

  try {
    rpc = scopeContainer.resolve(RPC);
    rpc.setProvider(rpcUrl);

    for (const contract of resolveScopeContracts(scopeContainer)) {
      contract.setChain(chainName);
    }

    return {
      chainId: options.chainId,
      chainName,
      container: scopeContainer,
      rpc,
      resolve: <T>(token: InjectionToken<T>) => scopeContainer.resolve(token),
      dispose: () => {
        try {
          rpc?.destroyProvider();
        } finally {
          scopeContainer.dispose();
        }
      }
    };
  } catch (error) {
    try {
      rpc?.destroyProvider();
    } finally {
      scopeContainer.dispose();
    }
    throw error;
  }
}
