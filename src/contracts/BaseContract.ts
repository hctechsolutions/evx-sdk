import { IBaseContract } from '@interfaces/contracts/IBaseContract';
import { chains, ChainName, ContractName } from 'resources/chains';
import { RPC } from '@providers/RPC';
import { ethers, Signer } from 'ethers';
import { env } from 'resources/env';

export abstract class BaseContract implements IBaseContract {
  signer: Signer | null | undefined = null;
  chain: ChainName = env.chain;
  instance: ethers.Contract;
  name: ContractName;
  rpc: RPC;
  abi: any;

  constructor(
    name: ContractName,
    rpc: RPC,
    abi: any
  ) {
    this.rpc = rpc;
    this.name = name;
    this.abi = abi;
    this.instance = new ethers.Contract(
      this.getAddress(),
      this.abi,
      this.rpc.provider
    );
  }

  async setSigner(signer?: Signer | null): Promise<void> {
    this.signer = signer;

    if (!signer) {
      this.instance = new ethers.Contract(
        this.getAddress(),
        this.abi,
        this.rpc.provider
      );

      return;
    }

    this.instance = new ethers.Contract(
      this.getAddress(),
      this.abi,
      signer
    );
  }

  setChain(chain: keyof typeof chains): void {
    this.chain = chain;
    this.instance = new ethers.Contract(
      this.getAddress(),
      this.abi,
      this.rpc.provider
    );
  }

  getAddress(): string {
    const address = chains[this.chain]?.[this.name];
    if (!address) {
      throw new Error(`Address not found for ${this.chain}.${this.name}`);
    }
    return address;
  }
}
