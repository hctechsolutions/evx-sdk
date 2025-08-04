import { IBaseContract } from '@interfaces/contracts/IBaseContract';
import { chains } from '@resources';
import { ChainName, ContractName } from '@interfaces';
import { ethers, Signer } from 'ethers';
import { RPC } from '@providers';

/**
 * @title Base Contract
 * @notice Base class for all contract interactions
 * @dev Provides common functionality for contract instances including signer management and chain switching
 */
export abstract class BaseContract implements IBaseContract {
  signer: Signer | null | undefined = null;
  chain: ChainName = 'sepolia';
  instance: ethers.Contract;
  name: ContractName;
  rpc: RPC;
  abi: any;

  /**
   * @notice Creates a new contract instance
   * @param name The name of the contract
   * @param rpc The RPC provider instance
   * @param abi The contract ABI
   */
  constructor(name: ContractName, rpc: RPC, abi: any) {
    this.rpc = rpc;
    this.name = name;
    this.abi = abi;
    this.instance = new ethers.Contract(this.getAddress(), this.abi, this.rpc.provider);
  }

  /**
   * @notice Sets the signer for contract interactions
   * @param signer The signer to use for transactions
   */
  async setSigner(signer?: Signer | null): Promise<void> {
    this.signer = signer;

    if (!signer) {
      this.instance = new ethers.Contract(this.getAddress(), this.abi, this.rpc.provider);

      return;
    }

    this.instance = new ethers.Contract(this.getAddress(), this.abi, signer);
  }

  /**
   * @notice Sets the chain for contract interactions
   * @param chain The chain to use for contract interactions
   */
  setChain(chain: keyof typeof chains): void {
    this.chain = chain;
    this.instance = new ethers.Contract(this.getAddress(), this.abi, this.rpc.provider);
  }

  /**
   * @notice Gets the contract address for the current chain
   * @returns The contract address
   * @throws Error if address is not found for the current chain
   */
  getAddress(): string {
    const chain = chains[this.chain];
    if (!chain) {
      throw new Error(`Chain not found: ${this.chain}`);
    }

    const address = chain.contracts[this.name];
    if (!address) {
      throw new Error(`Address not found for ${this.chain}.${this.name}`);
    }
    return address;
  }
}
