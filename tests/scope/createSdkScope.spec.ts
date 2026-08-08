import 'reflect-metadata';
import { container } from 'tsyringe';
import { createSdkScope } from '../../src/scope';
import { RPC } from '@providers';
import { FactoryContract, QuoterContract } from '@contracts';
import { GetPoolQuery } from '@queries/pool';

describe('createSdkScope (AD-21 isolation)', () => {
  afterEach(() => {
    container.clearInstances();
  });

  it('rejects empty rpcUrl', () => {
    expect(() =>
      createSdkScope({ rpcUrl: '   ', chainId: 11155111 })
    ).toThrow(/rpcUrl is required/);
  });

  it('rejects unsupported chainId', () => {
    expect(() =>
      createSdkScope({ rpcUrl: 'http://rpc-a.test', chainId: 1 as any })
    ).toThrow(/Unsupported chainId/);
  });

  it('isolates provider and chain across concurrent Sepolia + Hoodi scopes', async () => {
    const sepolia = createSdkScope({
      rpcUrl: 'http://rpc-sepolia.test',
      chainId: 11155111
    });
    const hoodi = createSdkScope({
      rpcUrl: 'http://rpc-hoodi.test',
      chainId: 560048
    });

    try {
      await Promise.all([
        Promise.resolve().then(() => {
          expect(sepolia.chainName).toBe('sepolia');
          expect(sepolia.rpc.provider).not.toBeNull();

          const sepoliaFactory = sepolia.resolve(FactoryContract);
          const sepoliaQuoter = sepolia.resolve(QuoterContract);
          const sepoliaRpc = sepolia.resolve(RPC);

          expect(sepoliaRpc).toBe(sepolia.rpc);
          expect(sepoliaFactory.chain).toBe('sepolia');
          expect(sepoliaQuoter.chain).toBe('sepolia');
          expect(sepoliaFactory.rpc).toBe(sepolia.rpc);
          expect(sepoliaQuoter.rpc).toBe(sepolia.rpc);
        }),
        Promise.resolve().then(() => {
          expect(hoodi.chainName).toBe('hoodi');

          const hoodiFactory = hoodi.resolve(FactoryContract);
          const hoodiQuoter = hoodi.resolve(QuoterContract);
          const hoodiRpc = hoodi.resolve(RPC);

          expect(hoodiRpc).toBe(hoodi.rpc);
          expect(hoodiFactory.chain).toBe('hoodi');
          expect(hoodiQuoter.chain).toBe('hoodi');
          expect(hoodiFactory.rpc).toBe(hoodi.rpc);
          expect(hoodiQuoter.rpc).toBe(hoodi.rpc);
        })
      ]);

      expect(sepolia.rpc).not.toBe(hoodi.rpc);
      expect(sepolia.rpc.provider).not.toBe(hoodi.rpc.provider);
      expect(sepolia.resolve(FactoryContract)).not.toBe(
        hoodi.resolve(FactoryContract)
      );
      expect(sepolia.resolve(GetPoolQuery)).not.toBe(
        hoodi.resolve(GetPoolQuery)
      );
      expect(sepolia.resolve(FactoryContract).chain).toBe('sepolia');
      expect(hoodi.resolve(FactoryContract).chain).toBe('hoodi');

      const rootRpc = container.resolve(RPC);
      expect(rootRpc).not.toBe(sepolia.rpc);
      expect(rootRpc).not.toBe(hoodi.rpc);
    } finally {
      sepolia.dispose();
      hoodi.dispose();
    }
  });

  it('does not mutate sibling scope when configuring another', () => {
    const a = createSdkScope({
      rpcUrl: 'http://rpc-a.test',
      chainId: 11155111
    });
    const b = createSdkScope({
      rpcUrl: 'http://rpc-b.test',
      chainId: 560048
    });

    try {
      expect(a.resolve(FactoryContract).chain).toBe('sepolia');
      expect(b.resolve(FactoryContract).chain).toBe('hoodi');
      expect(a.rpc).not.toBe(b.rpc);
    } finally {
      a.dispose();
      b.dispose();
    }
  });
});
