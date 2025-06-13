# Nebular SDK

The Nebular SDK is a TypeScript developer toolkit designed to simplify interaction with the Nebular decentralized liquidity protocol. It provides a high-level abstraction over the core smart contracts. Built using a modular CQRS (Command Query Responsibility Segregation) architecture for scalability and clarity.

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Coverage](https://img.shields.io/badge/tests-coming_soon-yellow)

---

## Features

* Connect to any EVM-compatible chain
* CQRS-based structure (`commands`, `queries`)
* Minimal and typed interaction with contracts (ethers.js)
* Query pools and token pairs with ease

---

## Installation

```bash
npm install @nebular/sdk
# or
yarn add @nebular/sdk
```

## Usage

### Read pool info direcly from blockchain

```ts
import { GetPoolQuery } from 'queries/GetPoolQuery';
import { container } from 'tsyringe';

const getPool = container.resolve(GetPoolQuery);

const pool = await getPool.execute({ 
  address: '0x7Fb01B2d918Edcad3d3a05b5B7A511ACA1C66aD8' 
})

console.table(pool)
```

---

## Supported Networks

* Ethereum Mainnet
* Sepolia
* Add your own in `resources/chains.ts`

---

## Environment Configuration

Crie um arquivo `.env`:

```
CHAIN=mainnet
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

---

## Testing

> Tests are being written and will be available soon.

---

## Contributing

Pull requests are welcome! Clone o repositório, crie uma branch com sua feature ou correção e envie um PR.

```bash
git clone https://github.com/nebular-finance/nebular-sdk
cd nebular-sdk
npm install
```
