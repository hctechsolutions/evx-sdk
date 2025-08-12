import { ProposalSnapshotQuery } from '@queries/dao';
import { EvxGovernanceContract } from '@contracts';
import { IProposalSnapshotQueryParams } from '@interfaces/queries/params/IProposalSnapshotQueryParams';

describe('ProposalSnapshotQuery', () => {
  let query: ProposalSnapshotQuery;
  let governance: jest.Mocked<EvxGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        proposalSnapshot: jest.fn(),
      },
    } as any;

    query = new ProposalSnapshotQuery(governance);
  });

  it('should execute proposal snapshot query successfully', async () => {
    const mockSnapshot = BigInt(1735689600); // Example block/timestamp
    (governance.instance.proposalSnapshot as unknown as jest.Mock).mockResolvedValue(mockSnapshot);

    const params: IProposalSnapshotQueryParams = {
      proposalId: BigInt(123),
    };

    const result = await query.execute(params);

    expect(governance.instance.proposalSnapshot).toHaveBeenCalledWith(
      params.proposalId
    );
    expect(result).toBe(mockSnapshot);
  });

  it('should handle errors during proposal snapshot query execution', async () => {
    const error = new Error('Query failed');
    (governance.instance.proposalSnapshot as unknown as jest.Mock).mockRejectedValue(error);

    const params: IProposalSnapshotQueryParams = {
      proposalId: BigInt(123),
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should handle different proposal IDs', async () => {
    const mockSnapshot1 = BigInt(1735689600);
    const mockSnapshot2 = BigInt(1735776000);
    
    (governance.instance.proposalSnapshot as unknown as jest.Mock)
      .mockResolvedValueOnce(mockSnapshot1)
      .mockResolvedValueOnce(mockSnapshot2);

    const params1: IProposalSnapshotQueryParams = {
      proposalId: BigInt(123),
    };

    const params2: IProposalSnapshotQueryParams = {
      proposalId: BigInt(456),
    };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.proposalSnapshot).toHaveBeenCalledWith(BigInt(123));
    expect(governance.instance.proposalSnapshot).toHaveBeenCalledWith(BigInt(456));
    expect(result1).toBe(mockSnapshot1);
    expect(result2).toBe(mockSnapshot2);
  });
}); 