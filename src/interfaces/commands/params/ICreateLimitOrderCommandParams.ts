import { IBaseCommandParams } from './IBaseCommandParams';
import { ILimitOrderParams } from '@interfaces/contracts/ILimitOrderParams';

/**
 * @title Create Limit Order Command Parameters Interface
 * @notice Interface for parameters needed to create a limit order
 */
export interface ICreateLimitOrderCommandParams extends IBaseCommandParams {
  /** The limit order parameters */
  limitOrderParams: ILimitOrderParams;
  /** Optional gas fee amount for Gelato execution (in wei) */
  gelatoFee?: bigint;
  /** Optional Gelato API key for automation */
  gelatoApiKey?: string;
}
