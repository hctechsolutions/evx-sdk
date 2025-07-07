import { Eip712DomainQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IEip712DomainQueryParams } from '@interfaces/queries/params/IEip712DomainQueryParams';

describe('Eip712DomainQuery', () => {
  let query: Eip712DomainQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        eip712Domain: jest.fn(),
      },
    } as any;

    query = new Eip712DomainQuery(governance);
  });

  it('should execute eip712Domain query successfully', async () => {
    const mockResult = {
      fields: '0x01',
      name: 'EvexDAO',
      version: '1',
      chainId: 1,
      verifyingContract: '0x123',
      salt: '0xabc',
      extensions: [1, 2, 3],
    };
    (governance.instance.eip712Domain as unknown as jest.Mock).mockResolvedValue(mockResult);

    const params: IEip712DomainQueryParams = {};

    const result = await query.execute(params);

    expect(governance.instance.eip712Domain).toHaveBeenCalledWith();
    expect(result).toEqual({
      fields: mockResult.fields,
      name: mockResult.name,
      version: mockResult.version,
      chainId: BigInt(mockResult.chainId),
      verifyingContract: mockResult.verifyingContract,
      salt: mockResult.salt,
      extensions: [BigInt(1), BigInt(2), BigInt(3)],
    });
  });

  it('should handle errors during eip712Domain query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.eip712Domain as unknown as jest.Mock).mockRejectedValue(error);

    const params: IEip712DomainQueryParams = {};

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
}); 