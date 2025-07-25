import { IGetTokenURIQueryParams } from '@interfaces/queries/params/IGetTokenURIQueryParams';
import { IGetTokenURIQueryOutput } from '@interfaces/queries/outputs/IGetTokenURIQueryOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { PositionManagerContract } from '@contracts';

/**
 * @title Get Token URI Query
 * @notice Gets the token URI for a given NFT position and decodes the JSON from base64
 * @dev This query interacts with the PositionManagerContract to get and decode the token URI
 */
@injectable()
@singleton()
export class GetTokenURIQuery
  implements IBaseQuery<IGetTokenURIQueryParams, IGetTokenURIQueryOutput>
{
  constructor(
    @inject(PositionManagerContract)
    private readonly positionManager: PositionManagerContract
  ) {}

  /**
   * @notice Executes the get token URI query
   * @param params The parameters for getting the token URI (must include tokenId)
   * @returns The decoded JSON object from the token URI
   */
  async execute(params: IGetTokenURIQueryParams): Promise<IGetTokenURIQueryOutput> {
    const tokenURI = await this.positionManager.instance.tokenURI(params.tokenId);
    const base64Match = tokenURI.match(/^data:application\/json;base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid tokenURI format');
    }
    const jsonStr = Buffer.from(base64Match[1], 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  }
}
