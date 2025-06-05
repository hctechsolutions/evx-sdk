import { PositionManagerContract } from "./PositionManagerContract";
import { FactoryContract } from "./FactoryContract";
import { ChainName } from "resources/chains";
import { container } from "tsyringe";
import { Signer } from "ethers";


const allContracts = [
  container.resolve(PositionManagerContract),
  container.resolve(FactoryContract),
];

export async function setSignerAll(signer: Signer) {
  await Promise.all(allContracts.map(c => c.setSigner(signer)));
}

export async function setChainAll(chain: ChainName) {
  await Promise.all(allContracts.map(c => c.setChain(chain)));
}

export * from "./PositionManagerContract";
export * from "./FactoryContract";
export * from "./PoolContract";
