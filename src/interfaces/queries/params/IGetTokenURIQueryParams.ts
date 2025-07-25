import { IBaseQueryParams } from '@interfaces/queries/IBaseQueryParams';

/**
 * @notice Parameters for the get token URI query
 * @dev Requires the tokenId for the NFT position
 */
export interface IGetTokenURIQueryParams extends IBaseQueryParams {
  tokenId: bigint;
}
