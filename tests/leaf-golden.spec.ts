import { createHash } from 'crypto';
import { keccak256, solidityPackedKeccak256 } from 'ethers';
import golden from './fixtures/leaf-golden.json';

/** OpenZeppelin MerkleProof sorted pairwise hash (Foundry `_hashPair`). */
function hashPair(a: string, b: string): string {
  const [left, right] = a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
  return keccak256(
    Uint8Array.from(
      Buffer.concat([
        Buffer.from(left.slice(2), 'hex'),
        Buffer.from(right.slice(2), 'hex')
      ])
    )
  );
}

function processProof(leaf: string, proof: string[]): string {
  return proof.reduce((computed, sibling) => hashPair(computed, sibling), leaf);
}

/** Pinned sha256(sorted leaf hex joined) — D29 cross-repo drift detector. */
const PINNED_DATASET_HASH =
  '68ae92d892f800cfb2f07c88dbdd4757427913f592d79ded281fcfb9d0efa960';

/**
 * Story 5.4 D29 — leaf encoding must match Foundry / Back seed / generator.
 */
describe('leaf-golden fixture (D29)', () => {
  it('encodes each leaf identically to golden JSON', () => {
    expect(golden.leaves.length).toBeGreaterThan(0);
    for (const leaf of golden.leaves) {
      const computed = solidityPackedKeccak256(
        ['uint256', 'address', 'uint256'],
        [leaf.index, leaf.account, BigInt(leaf.amount)]
      );
      expect(computed.toLowerCase()).toBe(leaf.leaf.toLowerCase());
    }
  });

  it('merkleRoot matches OZ sorted-hash over golden leaves + proofs', () => {
    expect(golden.merkleRoot).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(typeof golden.totalAllocated).toBe('string');
    expect(BigInt(golden.totalAllocated)).toBe(
      golden.leaves.reduce((acc, l) => acc + BigInt(l.amount), 0n)
    );
    expect(golden.allocationCount).toBe(golden.leaves.length);

    const [leaf0, leaf1] = golden.leaves;
    const recomputedRoot = hashPair(leaf0.leaf, leaf1.leaf);
    expect(recomputedRoot.toLowerCase()).toBe(golden.merkleRoot.toLowerCase());

    for (const leaf of golden.leaves) {
      const proof = golden.proofs[String(leaf.index) as keyof typeof golden.proofs];
      expect(proof).toBeDefined();
      const rootFromProof = processProof(leaf.leaf, proof);
      expect(rootFromProof.toLowerCase()).toBe(golden.merkleRoot.toLowerCase());
    }
  });

  it('datasetHash is pinned over sorted leaf hashes', () => {
    const concat = golden.leaves.map((l) => l.leaf.toLowerCase()).sort().join('');
    const hash = createHash('sha256').update(concat).digest('hex');
    expect(hash).toBe(PINNED_DATASET_HASH);
  });
});
