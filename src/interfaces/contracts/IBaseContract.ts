import { RPC } from "@providers/RPC";
import { ChainName, chains, ContractName } from "resources/chains";
import { ethers, Signer } from "ethers";

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
