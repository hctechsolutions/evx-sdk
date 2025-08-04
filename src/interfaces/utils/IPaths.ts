export interface Pool {
  address: string;
  fee: string;
  token0: {
    address: string;
  };
  token1: {
    address: string;
  };
}

export interface PathNode {
  token: string;
  pool?: string;
  previous?: PathNode;
  distance: number;
}

export interface TradingPath {
  pools: string[];
  tokens: string[];
  hops: number;
}

export interface EncodedPath {
  pathString: string;
  pathBytes: string;
  pools: string[];
  tokens: string[];
  fees: string[];
  hops: number;
}
