import { Contract } from "ethers";

export interface IBaseContract {
  readonly address: string;
  readonly instance: Contract;
}
