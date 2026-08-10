/**
 * @title Path Finding Utilities
 * @notice Utilities for finding the shortest path between tokens through pools
 * @dev Implements breadth-first search algorithm to find optimal trading paths
 */

import { Pool, PathNode, TradingPath, EncodedPath } from '@interfaces/utils';
import { getAddress } from 'ethers';

/**
 * @notice Pool lookup without sorting overhead
 * @dev Uses direct string comparison for maximum performance
 */
class PoolLookup {
  private poolByTokens = new Map<string, Pool>();
  private poolByAddress = new Map<string, Pool>();

  constructor(pools: Pool[]) {
    this.buildLookupMaps(pools);
  }

  /**
   * @notice Builds lookup maps without sorting overhead
   */
  private buildLookupMaps(pools: Pool[]): void {
    for (const pool of pools) {
      // Store by address
      this.poolByAddress.set(pool.address, pool);

      // Store by token pair (both directions for O(1) lookup)
      const token0 = pool.token0.address.toLowerCase();
      const token1 = pool.token1.address.toLowerCase();

      // Create keys for both directions without sorting
      const key1 = `${token0}-${token1}`;
      const key2 = `${token1}-${token0}`;

      this.poolByTokens.set(key1, pool);
      this.poolByTokens.set(key2, pool);
    }
  }

  /**
   * @notice O(1) lookup for pool by token pair (no sorting)
   */
  getPoolByTokens(token1: string, token2: string): Pool | undefined {
    const key = `${token1.toLowerCase()}-${token2.toLowerCase()}`;
    return this.poolByTokens.get(key);
  }

  /**
   * @notice O(1) lookup for pool by address
   */
  getPoolByAddress(address: string): Pool | undefined {
    return this.poolByAddress.get(address);
  }
}

/**
 * @notice Finds the shortest path between two tokens through available pools
 * @param pools Array of available pools
 * @param inputToken Address of the input token
 * @param outputToken Address of the output token
 * @returns The shortest trading path or null if no path exists
 */
export function findShortestPath(
  pools: Pool[],
  inputToken: string,
  outputToken: string
): TradingPath | null {
  const input = inputToken.toLowerCase();
  const output = outputToken.toLowerCase();

  if (input === output) {
    return {
      pools: [],
      tokens: [inputToken],
      hops: 0
    };
  }

  // Build a lookup without sorting overhead
  const lookup = new PoolLookup(pools);

  // Build adjacency list without sorting overhead
  const connections = buildTokenConnections(pools);

  // Find path
  const path = breadthFirstSearch(connections, input, output);

  if (!path) return null;

  // Convert to trading path with O(1) lookups
  return convertPathToTradingPath(path, lookup);
}

export function findShortestPathEncoded(
  pools: Pool[],
  inputToken: string,
  outputToken: string,
  isExactOutput = false
): EncodedPath | null {
  const path = findShortestPath(pools, inputToken, outputToken);
  return path ? encodePath(path, pools, isExactOutput) : null;
}

/**
 * @notice Builds adjacency list
 * @param pools Array of available pools
 * @returns Map of token addresses to their connections
 */
function buildTokenConnections(pools: Pool[]): Map<string, Set<string>> {
  const connections = new Map<string, Set<string>>();

  for (const pool of pools) {
    // Direct comparison without sorting for maximum performance
    const token0 = pool.token0.address.toLowerCase();
    const token1 = pool.token1.address.toLowerCase();

    // Add both directions without sorting overhead
    if (!connections.has(token0)) {
      connections.set(token0, new Set());
    }
    connections.get(token0)!.add(token1);

    if (!connections.has(token1)) {
      connections.set(token1, new Set());
    }
    connections.get(token1)!.add(token0);
  }

  return connections;
}

/**
 * @notice Performs breadth-first search to find shortest path between tokens
 * @param connections Token adjacency list
 * @param startToken Starting token address
 * @param endToken Ending token address
 * @returns Array of path nodes or null if no path exists
 */
function breadthFirstSearch(
  connections: Map<string, Set<string>>,
  startToken: string,
  endToken: string
): PathNode[] | null {
  const queue: PathNode[] = [{ token: startToken, distance: 0 }];
  const visited = new Set<string>();
  const pathMap = new Map<string, PathNode>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.token === endToken) {
      return reconstructPath(current);
    }

    if (visited.has(current.token)) {
      continue;
    }

    visited.add(current.token);
    pathMap.set(current.token, current);

    const neighbors = connections.get(current.token);
    if (!neighbors) {
      continue;
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const neighborNode: PathNode = {
          token: neighbor,
          previous: current,
          distance: current.distance + 1
        };
        queue.push(neighborNode);
      }
    }
  }

  return null; // No path found
}

/**
 * @notice Reconstructs the path from the end node back to the start
 * @param endNode The final node in the path
 * @returns Array of path nodes in order from start to end
 */
function reconstructPath(endNode: PathNode): PathNode[] {
  const path: PathNode[] = [];
  let current: PathNode | undefined = endNode;

  while (current) {
    path.unshift(current);
    current = current.previous;
  }

  return path;
}

/**
 * @notice Converts a path of tokens to a trading path with pool addresses
 * @param path Array of path nodes
 * @param lookup Pool lookup table
 * @returns Trading path with pool addresses and token addresses
 */
function convertPathToTradingPath(path: PathNode[], lookup: PoolLookup): TradingPath {
  const poolAddresses: string[] = [];
  const tokenAddresses: string[] = [];

  // Add first token
  tokenAddresses.push(path[0].token);

  // Find pools for each consecutive pair of tokens with O(1) lookup
  for (let i = 0; i < path.length - 1; i++) {
    const currentToken = path[i].token;
    const nextToken = path[i + 1].token;

    // O(1) pool lookup without sorting
    const pool = lookup.getPoolByTokens(currentToken, nextToken);
    if (pool) {
      poolAddresses.push(pool.address);
    }

    // Add next token
    tokenAddresses.push(nextToken);
  }

  return {
    pools: poolAddresses,
    tokens: tokenAddresses,
    hops: path.length - 1
  };
}

/**
 * @notice Encodes a trading path for use with SwapRouter
 * @param path Trading path to encode
 * @param pools Array of available pools
 * @param isExactOutput Whether this is for exact output (reverses the path)
 * @returns Encoded path with all necessary data for SwapRouter
 */
function encodePath(path: TradingPath, pools: Pool[], isExactOutput = false): EncodedPath {
  if (path.tokens.length < 2) {
    throw new Error('Path must have at least 2 tokens');
  }

  const lookup = new PoolLookup(pools);
  const encodedTokens: string[] = [];
  const encodedFees: string[] = [];
  const encodedPools: string[] = [];

  // For exact output, we need to reverse the path
  const tokens = isExactOutput ? [...path.tokens].reverse() : path.tokens;
  const poolsList = isExactOutput ? [...path.pools].reverse() : path.pools;

  // Normalize first token to checksummed format
  let normalizedFirstToken: string;
  try {
    normalizedFirstToken = getAddress(tokens[0]);
  } catch {
    // If getAddress fails, use as-is (might already be checksummed or invalid)
    normalizedFirstToken = tokens[0];
  }
  encodedTokens.push(normalizedFirstToken);

  // Process each hop - each hop adds: fee + next_token
  for (let i = 0; i < poolsList.length; i++) {
    const pool = lookup.getPoolByAddress(poolsList[i]);
    if (!pool) {
      throw new Error(`Pool not found: ${poolsList[i]}`);
    }

    // Add fee for this hop
    encodedFees.push(pool.fee);

    // Normalize next token to checksummed format
    let normalizedNextToken: string;
    try {
      normalizedNextToken = getAddress(tokens[i + 1]);
    } catch {
      // If getAddress fails, use as-is (might already be checksummed or invalid)
      normalizedNextToken = tokens[i + 1];
    }
    encodedTokens.push(normalizedNextToken);
    encodedPools.push(pool.address);
  }

  // Create the encoded path bytes in the format: token0 + fee0 + token1 + fee1 + token2 + ...
  const pathData: (string | number)[] = [];

  // Always add the first token
  pathData.push(encodedTokens[0]);

  // Then add fee + token for each hop
  for (let i = 0; i < encodedFees.length; i++) {
    pathData.push(parseInt(encodedFees[i])); // fee as uint24
    pathData.push(encodedTokens[i + 1]); // next token
  }

  // Create path string for display
  const pathString = pathData.join(':');

  // Create the bytes-encoded path: token0 (20 bytes) + fee0 (3 bytes) + token1 (20 bytes) + ...
  let encodedBytes = '0x';
  for (let i = 0; i < encodedFees.length; i++) {
    // Add token address (remove 0x prefix and ensure 40 hex chars = 20 bytes)
    encodedBytes += encodedTokens[i].slice(2);
    // Add fee as 3 bytes (6 hex characters)
    encodedBytes += parseInt(encodedFees[i]).toString(16).padStart(6, '0');
  }
  // Add the last token
  encodedBytes += encodedTokens[encodedTokens.length - 1].slice(2);

  return {
    pathString: pathString,
    pathBytes: encodedBytes,
    pools: encodedPools,
    tokens: encodedTokens,
    fees: encodedFees,
    hops: path.hops
  };
}
