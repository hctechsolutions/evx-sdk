import { SupportsInterfaceQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { ISupportsInterfaceQueryParams } from '@interfaces/queries/params/ISupportsInterfaceQueryParams';

describe('SupportsInterfaceQuery', () => {
  let query: SupportsInterfaceQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        supportsInterface: jest.fn()
      }
    } as any;

    query = new SupportsInterfaceQuery(governance);
  });

  it('should execute supports interface query successfully when interface is supported', async () => {
    const mockSupported = true;
    (governance.instance.supportsInterface as unknown as jest.Mock).mockResolvedValue(
      mockSupported
    );

    const params: ISupportsInterfaceQueryParams = {
      interfaceId: '0x01ffc9a7' // ERC165 interface ID
    };

    const result = await query.execute(params);

    expect(governance.instance.supportsInterface).toHaveBeenCalledWith(params.interfaceId);
    expect(result).toBe(mockSupported);
  });

  it('should execute supports interface query successfully when interface is not supported', async () => {
    const mockSupported = false;
    (governance.instance.supportsInterface as unknown as jest.Mock).mockResolvedValue(
      mockSupported
    );

    const params: ISupportsInterfaceQueryParams = {
      interfaceId: '0xffffffff' // Invalid interface ID
    };

    const result = await query.execute(params);

    expect(governance.instance.supportsInterface).toHaveBeenCalledWith(params.interfaceId);
    expect(result).toBe(mockSupported);
  });

  it('should handle errors during supports interface query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.supportsInterface as unknown as jest.Mock).mockRejectedValue(error);

    const params: ISupportsInterfaceQueryParams = {
      interfaceId: '0x01ffc9a7'
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
