import { GetProposalIdQuery } from '@queries/dao';
import { GovernanceContract } from '@contracts';
import { IGetProposalIdQueryParams } from '@interfaces/queries/params/IGetProposalIdQueryParams';

describe('GetProposalIdQuery', () => {
  let query: GetProposalIdQuery;
  let governance: jest.Mocked<GovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        getProposalId: jest.fn()
      }
    } as any;

    query = new GetProposalIdQuery(governance);
  });

  it('should execute get proposal ID query successfully', async () => {
    const mockProposalId = BigInt(123456789);
    (governance.instance.getProposalId as unknown as jest.Mock).mockResolvedValue(mockProposalId);

    const params: IGetProposalIdQueryParams = {
      targets: ['0x1234567890123456789012345678901234567890'],
      values: [BigInt(0)],
      calldatas: ['0x'],
      descriptionHash: '0x1234567890123456789012345678901234567890123456789012345678901234'
    };

    const result = await query.execute(params);

    expect(governance.instance.getProposalId).toHaveBeenCalledWith(
      params.targets,
      params.values,
      params.calldatas,
      params.descriptionHash
    );
    expect(result).toBe(mockProposalId);
  });

  it('should handle errors during get proposal ID query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.getProposalId as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetProposalIdQueryParams = {
      targets: ['0x1234567890123456789012345678901234567890'],
      values: [BigInt(0)],
      calldatas: ['0x'],
      descriptionHash: '0x1234567890123456789012345678901234567890123456789012345678901234'
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });
});
