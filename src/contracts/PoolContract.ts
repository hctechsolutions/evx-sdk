import NebularPoolABI from '@abis/NebularPool.json';
import { RPC } from '@providers/RPC';
import { container } from 'tsyringe';
import { ethers, Signer } from 'ethers';

export class PoolContract {
  instance: ethers.Contract;
  rpc: RPC;
  address: string;

  constructor(address: string) {
    this.address = address;
    this.rpc = container.resolve(RPC);
    this.instance = new ethers.Contract(
      address,
      NebularPoolABI,
      this.rpc.provider
    );
  }


  async setSigner(signer?: Signer | null): Promise<void> {

    if (!signer) {
      this.instance = new ethers.Contract(
        this.address,
        NebularPoolABI,
        this.rpc.provider
      );

      return;
    }

    this.instance = new ethers.Contract(
      this.address,
      NebularPoolABI,
      signer
    );
  }
}
