import { BaseContract } from './BaseContract';
import { RPC } from '@providers';
import PositionLensABI from '@abis/PositionLens.json';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';

/**
 * @title Position Lens Contract
 * @notice Contract for interacting with the Position Lens contract
 * @dev Extends BaseContract to provide position lens functionality
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class PositionLensContract extends BaseContract {
  constructor(
    @inject(RPC)
    readonly rpc: RPC
  ) {
    super('positionLens', rpc, PositionLensABI);
  }
}
