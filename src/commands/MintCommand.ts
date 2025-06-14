import { IMintCommandParams } from '@interfaces/commands/params/IMintCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Mint Command
 * @notice Creates a new position by providing liquidity to a pool
 * @dev This command interacts with the PositionManager contract to mint a new position
 */
@injectable()
@singleton()
export class MintCommand implements IBaseCommand<IMintCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the mint command
   * @param params The parameters for minting a position
   * @param params.token0 The address of the first token
   * @param params.token1 The address of the second token
   * @param params.fee The fee tier of the pool
   * @param params.tickLower The lower tick of the position
   * @param params.tickUpper The upper tick of the position
   * @param params.amount0Desired The desired amount of token0
   * @param params.amount1Desired The desired amount of token1
   * @param params.amount0Min The minimum amount of token0 to accept
   * @param params.amount1Min The minimum amount of token1 to accept
   * @param params.recipient The address that will receive the position
   * @param params.deadline The deadline for the transaction
   */
  async execute(params: IMintCommandParams): Promise<void> {
    try {
      const transaction = await this.positionManager.instance.mint({
        token0: params.token0,
        token1: params.token1,
        fee: params.fee,
        tickLower: params.tickLower,
        tickUpper: params.tickUpper,
        amount0Desired: params.amount0Desired,
        amount1Desired: params.amount1Desired,
        amount0Min: params.amount0Min,
        amount1Min: params.amount1Min,
        recipient: params.recipient,
        deadline: params.deadline,
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      params.onDone?.(receipt);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }
} 