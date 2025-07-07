import { GetStateQuery } from '@queries/dao';
import { EvexGovernanceContract } from '@contracts';
import { IGetStateQueryParams } from '@interfaces/queries/params/IGetStateQueryParams';
import { ProposalState } from '@enums/ProposalState';

describe('GetStateQuery', () => {
  let query: GetStateQuery;
  let governance: jest.Mocked<EvexGovernanceContract>;

  beforeEach(() => {
    governance = {
      instance: {
        state: jest.fn(),
      },
    } as any;

    query = new GetStateQuery(governance);
  });

  it('should execute state query successfully for Active state', async () => {
    const mockState = ProposalState.Active;
    const proposalId = BigInt(123);
    
    (governance.instance.state as unknown as jest.Mock).mockResolvedValue(mockState);

    const params: IGetStateQueryParams = {
      proposalId,
    };

    const result = await query.execute(params);

    expect(governance.instance.state).toHaveBeenCalledWith(proposalId);
    expect(result).toBe(mockState);
  });

  it('should execute state query successfully for Succeeded state', async () => {
    const mockState = ProposalState.Succeeded;
    const proposalId = BigInt(456);
    
    (governance.instance.state as unknown as jest.Mock).mockResolvedValue(mockState);

    const params: IGetStateQueryParams = {
      proposalId,
    };

    const result = await query.execute(params);

    expect(governance.instance.state).toHaveBeenCalledWith(proposalId);
    expect(result).toBe(mockState);
  });

  it('should execute state query successfully for Defeated state', async () => {
    const mockState = ProposalState.Defeated;
    const proposalId = BigInt(789);
    
    (governance.instance.state as unknown as jest.Mock).mockResolvedValue(mockState);

    const params: IGetStateQueryParams = {
      proposalId,
    };

    const result = await query.execute(params);

    expect(governance.instance.state).toHaveBeenCalledWith(proposalId);
    expect(result).toBe(mockState);
  });

  it('should handle errors during state query execution', async () => {
    const error = new Error('Query failed');
    const proposalId = BigInt(123);
    
    (governance.instance.state as unknown as jest.Mock).mockRejectedValue(error);

    const params: IGetStateQueryParams = {
      proposalId,
    };

    await expect(query.execute(params)).rejects.toThrow('Query failed');
  });

  it('should return consistent state values for same proposal', async () => {
    const mockState = ProposalState.Active;
    const proposalId = BigInt(123);
    
    (governance.instance.state as unknown as jest.Mock)
      .mockResolvedValue(mockState);

    const params: IGetStateQueryParams = {
      proposalId,
    };

    const result1 = await query.execute(params);
    const result2 = await query.execute(params);

    expect(governance.instance.state).toHaveBeenCalledTimes(2);
    expect(governance.instance.state).toHaveBeenCalledWith(proposalId);
    expect(result1).toBe(mockState);
    expect(result2).toBe(mockState);
  });

  it('should handle different proposal IDs correctly', async () => {
    const mockState1 = ProposalState.Active;
    const mockState2 = ProposalState.Succeeded;
    const proposalId1 = BigInt(123);
    const proposalId2 = BigInt(456);
    
    (governance.instance.state as unknown as jest.Mock)
      .mockResolvedValueOnce(mockState1)
      .mockResolvedValueOnce(mockState2);

    const params1: IGetStateQueryParams = { proposalId: proposalId1 };
    const params2: IGetStateQueryParams = { proposalId: proposalId2 };

    const result1 = await query.execute(params1);
    const result2 = await query.execute(params2);

    expect(governance.instance.state).toHaveBeenCalledWith(proposalId1);
    expect(governance.instance.state).toHaveBeenCalledWith(proposalId2);
    expect(result1).toBe(mockState1);
    expect(result2).toBe(mockState2);
  });
}); 