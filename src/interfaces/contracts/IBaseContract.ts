import { ChainName, chains, ContractName } from "@resources";
import { ethers, Signer } from "ethers";
import { RPC } from "@providers";

export interface IBaseContract {
  signer: Signer | null | undefined;
  rpc: RPC;
  instance: ethers.Contract;
  name: ContractName;
  chain: ChainName;
  abi: any;

  setSigner(signer: Signer): void;
  setChain(chain: keyof typeof chains): void;
  getAddress(): string;
}
