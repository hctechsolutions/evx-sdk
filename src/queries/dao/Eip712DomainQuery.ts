import { IEip712DomainQueryParams } from '@interfaces/queries/params/IEip712DomainQueryParams';
import { IEip712DomainQueryOutput } from '@interfaces/queries/outputs/IEip712DomainQueryOutput';
import { IBaseQuery } from '@interfaces/queries/IBaseQuery';
import { injectable, inject, singleton } from 'tsyringe';
import { EvxGovernanceContract } from '@contracts';

/**
 * @title EIP-712 Domain Query
 * @notice Retrieves the EIP-712 domain from the EvxGovernance contract
 * @dev Queries the governance contract to get the EIP-712 domain fields
 */
@injectable()
@singleton()
export class Eip712DomainQuery
  implements IBaseQuery<IEip712DomainQueryParams, IEip712DomainQueryOutput>
{
  constructor(
    @inject(EvxGovernanceContract)
    private readonly governance: EvxGovernanceContract
  ) {}

  /**
   * @notice Executes the query to get the EIP-712 domain
   * @param params The parameters for the query (empty for eip712Domain function)
   * @returns The EIP-712 domain result
   */
  async execute(_?: IEip712DomainQueryParams): Promise<IEip712DomainQueryOutput> {
    const result = await this.governance.instance.eip712Domain();
    return {
      fields: result.fields,
      name: result.name,
      version: result.version,
      chainId: BigInt(result.chainId),
      verifyingContract: result.verifyingContract,
      salt: result.salt,
      extensions: result.extensions.map((e: any) => BigInt(e))
    };
  }
}
