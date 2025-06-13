import { PositionManagerContract } from "@contracts";
import { FactoryContract } from "@contracts";
import { ChainName } from "@resources";
import { container } from "tsyringe";
import { Signer } from "ethers";

function getWriterContracts() {
  return [
    container.resolve(PositionManagerContract),
    container.resolve(FactoryContract),
  ];
}

export async function setAllSigner(signer: Signer) {
  await Promise.all(getWriterContracts().map(c => c.setSigner(signer)));
}

export async function setAllChain(chain: ChainName) {
  await Promise.all(getWriterContracts().map(c => c.setChain(chain)));
}
