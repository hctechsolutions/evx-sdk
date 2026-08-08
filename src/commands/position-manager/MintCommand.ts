import { ethers } from 'ethers';
import { IMintCommandParams, MintResult } from '@interfaces/commands/params/IMintCommandParams';
import { IBaseCommand } from '@interfaces/commands/IBaseCommand';
import { injectable, inject, scoped, Lifecycle } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Mint Command
 * @notice Creates a new position by providing liquidity to a pool
 * @dev This command interacts with the PositionManager contract to mint a new position
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class MintCommand implements IBaseCommand<IMintCommandParams, void> {
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the mint command
   * @param params The parameters for minting a position
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
        deadline: params.deadline
      });

      params.onTransaction?.(transaction.hash);
      const receipt = await transaction.wait();

      const mintResult = this.parseMintResult(receipt as ethers.ContractTransactionReceipt);
      params.onDone?.(mintResult);
    } catch (error: any) {
      params.onFail?.(error);
    }
  }

  private parseMintResult(receipt: ethers.ContractTransactionReceipt): MintResult {
    const { interface: iface, target } = this.positionManager.instance;
    const addressLower = (target as string).toLowerCase();
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== addressLower) continue;
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed?.name === 'IncreaseLiquidity') {
          const [tokenId, liquidity, amount0, amount1] = parsed.args;
          return {
            tokenId: String(tokenId),
            liquidity: String(liquidity),
            amount0: String(amount0),
            amount1: String(amount1),
            transactionHash: receipt.hash
          };
        }
      } catch {
        continue;
      }
    }
    return {
      tokenId: '0',
      liquidity: '0',
      amount0: '0',
      amount1: '0',
      transactionHash: receipt.hash
    };
  }
}
