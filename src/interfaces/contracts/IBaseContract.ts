import { ChainName, ContractName } from '@interfaces';
import { ethers, Signer } from 'ethers';
import { RPC } from '@providers';

/**
 * @title Base Contract Interface
 * @notice Interface for contract interactions
 * @dev Defines the base contract structure for all contract implementations
 */
export interface IBaseContract {
  signer: Signer | null | undefined; // The current signer instance
  instance: ethers.Contract; // The ethers contract instance
  name: ContractName; // The name of the contract
  chain: ChainName; // The current chain
  rpc: RPC; // The RPC provider instance
  abi: any; // The contract ABI

  /**
   * @notice Sets the signer for contract interactions
   * @param signer The signer to use for transactions
   */
  setSigner(signer: Signer): void;

  /**
   * @notice Sets the chain for contract interactions
   * @param chain The chain to use for contract interactions
   */
  setChain(chain: ChainName): void;

  /**
   * @notice Gets the contract address for the current chain
   * @returns The contract address
   */
  getAddress(): string;
}
