import { createHash } from 'crypto';
import { keccak256, solidityPackedKeccak256 } from 'ethers';

/**
 * Canonical airdrop snapshot.
 * datasetHash identifies the allocation set.
 * distributionIdHash identifies the distribution and is the constructor bytes32.
 * configHash is off-chain. It binds token, root, deadline, distributionIdHash,
 * total, treasury and chain. The contract does not store it.
 */

export const AIRDROP_GENERATOR_VERSION = 'merkle-gen@1.0.0';

const UINT_RE = /^(0|[1-9][0-9]*)$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const BYTES32_RE = /^0x[0-9a-fA-F]{64}$/;

export type AirdropLeafInput = {
  index: number;
  account: string;
  amount: string;
};

export type AirdropLeaf = AirdropLeafInput & {
  leaf: string;
};

export type AirdropDistribution = {
  leaves: AirdropLeaf[];
  proofs: Record<string, string[]>;
  merkleRoot: string;
  totalAllocated: string;
  allocationCount: number;
  datasetPreimage: string;
  datasetHash: string;
  distributionPreimage: string;
  distributionIdHash: string;
  configPreimage: string;
  configHash: string;
};

export function canonicalUint(value: string | number | bigint): string {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error('unsigned integer required');
    }
    return value.toString();
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('unsigned integer required');
    }
    return String(value);
  }
  const text = value.trim();
  if (!UINT_RE.test(text)) {
    throw new Error(`canonical decimal required, received ${value}`);
  }
  return text;
}

export function canonicalAddress(value: string): string {
  const text = value.trim();
  if (!ADDRESS_RE.test(text)) {
    throw new Error(`address required, received ${value}`);
  }
  return text.toLowerCase();
}

export function canonicalBytes32(value: string): string {
  const text = value.trim();
  if (!BYTES32_RE.test(text)) {
    throw new Error(`bytes32 required, received ${value}`);
  }
  return text.toLowerCase();
}

export function emptyDatasetHash(): string {
  return sha256Hex('');
}

export function datasetLine(input: AirdropLeafInput): string {
  const index = canonicalUint(input.index);
  const account = canonicalAddress(input.account);
  const amount = canonicalUint(input.amount);
  if (amount === '0') {
    throw new Error('allocation amount must be non-zero');
  }
  return `${index}:${account}:${amount}`;
}

/** Numeric index order. Empty input hashes the empty UTF-8 string and is not a commitment. */
export function datasetPreimage(allocations: readonly AirdropLeafInput[]): string {
  if (allocations.length === 0) {
    return '';
  }
  const ordered = sortByIndex(allocations);
  return ordered.map((row) => datasetLine(row)).join('|');
}

export function hashDataset(allocations: readonly AirdropLeafInput[]): string {
  return sha256Hex(datasetPreimage(allocations));
}

export function distributionPreimage(input: {
  distributionId: string;
  chainId: string | number | bigint;
  merkleRoot: string;
  datasetHash: string;
}): string {
  const distributionId = canonicalDistributionId(input.distributionId);
  return [
    distributionId,
    canonicalUint(input.chainId),
    canonicalBytes32(input.merkleRoot),
    canonicalBytes32(input.datasetHash)
  ].join('|');
}

export function hashDistribution(input: {
  distributionId: string;
  chainId: string | number | bigint;
  merkleRoot: string;
  datasetHash: string;
}): string {
  return sha256Hex(distributionPreimage(input));
}

export function configPreimage(input: {
  token: string;
  merkleRoot: string;
  claimDeadline: string | number | bigint;
  distributionIdHash: string;
  totalAllocated: string | number | bigint;
  treasury: string;
  chainId: string | number | bigint;
}): string {
  return [
    canonicalAddress(input.token),
    canonicalBytes32(input.merkleRoot),
    canonicalUint(input.claimDeadline),
    canonicalBytes32(input.distributionIdHash),
    canonicalUint(input.totalAllocated),
    canonicalAddress(input.treasury),
    canonicalUint(input.chainId)
  ].join('|');
}

export function hashConfig(input: {
  token: string;
  merkleRoot: string;
  claimDeadline: string | number | bigint;
  distributionIdHash: string;
  totalAllocated: string | number | bigint;
  treasury: string;
  chainId: string | number | bigint;
}): string {
  return sha256Hex(configPreimage(input));
}

export function buildAirdropDistribution(input: {
  allocations: readonly AirdropLeafInput[];
  distributionId: string;
  chainId: string | number | bigint;
  token: string;
  treasury: string;
  claimDeadline: string | number | bigint;
}): AirdropDistribution {
  if (input.allocations.length === 0) {
    throw new Error('empty allocation set cannot be committed');
  }
  const ordered = sortByIndex(input.allocations);
  const leaves = ordered.map((row) => {
    const index = Number(canonicalUint(row.index));
    const account = canonicalAddress(row.account);
    const amount = canonicalUint(row.amount);
    if (amount === '0') {
      throw new Error('allocation amount must be non-zero');
    }
    const leaf = solidityPackedKeccak256(
      ['uint256', 'address', 'uint256'],
      [index, account, BigInt(amount)]
    ).toLowerCase();
    return { index, account, amount, leaf };
  });

  const { root, proofs } = merkle(leaves);
  let total = 0n;
  for (const leaf of leaves) {
    total += BigInt(leaf.amount);
  }
  const totalAllocated = total.toString();
  const datasetBody = datasetPreimage(leaves);
  const datasetHash = sha256Hex(datasetBody);
  const distributionBody = distributionPreimage({
    distributionId: input.distributionId,
    chainId: input.chainId,
    merkleRoot: root,
    datasetHash
  });
  const distributionIdHash = sha256Hex(distributionBody);
  const configBody = configPreimage({
    token: input.token,
    merkleRoot: root,
    claimDeadline: input.claimDeadline,
    distributionIdHash,
    totalAllocated,
    treasury: input.treasury,
    chainId: input.chainId
  });

  return {
    leaves,
    proofs,
    merkleRoot: root,
    totalAllocated,
    allocationCount: leaves.length,
    datasetPreimage: datasetBody,
    datasetHash,
    distributionPreimage: distributionBody,
    distributionIdHash,
    configPreimage: configBody,
    configHash: sha256Hex(configBody)
  };
}

function sortByIndex<T extends { index: number }>(rows: readonly T[]): T[] {
  const ordered = [...rows].sort(
    (left, right) => Number(canonicalUint(left.index)) - Number(canonicalUint(right.index))
  );
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].index === ordered[i - 1].index) {
      throw new Error(`duplicate allocation index ${ordered[i].index}`);
    }
  }
  const wallets = new Set<string>();
  for (const row of ordered) {
    const account = 'account' in row ? canonicalAddress(String(row.account)) : '';
    if (!account) {
      continue;
    }
    if (wallets.has(account)) {
      throw new Error(`duplicate allocation wallet ${account}`);
    }
    wallets.add(account);
  }
  return ordered;
}

function merkle(leaves: readonly AirdropLeaf[]): {
  root: string;
  proofs: Record<string, string[]>;
} {
  const layers: string[][] = [leaves.map((leaf) => leaf.leaf)];
  while (layers[layers.length - 1].length > 1) {
    const previous = layers[layers.length - 1];
    const next: string[] = [];
    for (let i = 0; i < previous.length; i += 2) {
      if (i + 1 === previous.length) {
        next.push(previous[i]);
      } else {
        next.push(hashPair(previous[i], previous[i + 1]));
      }
    }
    layers.push(next);
  }

  const proofs: Record<string, string[]> = {};
  leaves.forEach((leaf, index) => {
    const proof: string[] = [];
    let cursor = index;
    for (let level = 0; level < layers.length - 1; level += 1) {
      const layer = layers[level];
      const sibling = cursor % 2 === 0 ? cursor + 1 : cursor - 1;
      if (sibling < layer.length) {
        proof.push(layer[sibling]);
      }
      cursor = Math.floor(cursor / 2);
    }
    proofs[String(leaf.index)] = proof;
  });
  return { root: layers[layers.length - 1][0], proofs };
}

function hashPair(left: string, right: string): string {
  const [first, second] =
    left.toLowerCase() < right.toLowerCase() ? [left, right] : [right, left];
  return keccak256(
    Uint8Array.from(
      Buffer.concat([
        Buffer.from(first.slice(2), 'hex'),
        Buffer.from(second.slice(2), 'hex')
      ])
    )
  ).toLowerCase();
}

function canonicalDistributionId(value: string): string {
  if (!value || value !== value.trim() || value.includes('|')) {
    throw new Error('distributionId must be a non-empty token without "|"');
  }
  return value;
}

function sha256Hex(utf8: string): string {
  return `0x${createHash('sha256').update(utf8, 'utf8').digest('hex')}`;
}
