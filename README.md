# Evx SDK

The Evx SDK is a TypeScript developer toolkit designed to simplify interaction with the Evx decentralized liquidity protocol. It provides a high-level abstraction over the core smart contracts. Built using a modular CQRS (Command Query Responsibility Segregation) architecture for scalability and clarity.

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Coverage](https://img.shields.io/badge/tests-passing-green)

---

## Documentation

Welcome to the comprehensive documentation for the Evx SDK. This section contains detailed guides, workflows, and tools documentation.

**[Quick Start](#installation)** | **[Contributing](docs/contributing.md)** | **[Development Tools](#development)**

### Documentation Structure

#### **Getting Started**

| Section               | Description            | Link                                                    |
| --------------------- | ---------------------- | ------------------------------------------------------- |
| **Installation**      | Quick start guide      | [Getting Started](#installation)                        |
| **Basic Usage**       | Your first SDK queries | [Usage Examples](#usage)                                |
| **Environment Setup** | RPC configuration      | [Environment Configuration](#environment-configuration) |

#### **Development Tools**

| Section                | Description                  | Link                                       |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| **GitFlow Versioning** | GitFlow branching strategy   | [GitFlow Versioning](docs/versioning.md)   |
| **GitHub Workflows**   | CI/CD automation             | [GitHub Workflows](docs/workflows.md)      |

#### **Deployment**

| Section            | Description                   | Link                                |
| ------------------ | ----------------------------- | ----------------------------------- |
| **CI/CD Pipeline** | Automated builds and releases | [CI/CD Pipeline](docs/workflows.md) |

#### **Contributing**

| Section                | Description       | Link                                       |
| ---------------------- | ----------------- | ------------------------------------------ |
| **Contributing Guide** | How to contribute | [Contributing Guide](docs/contributing.md) |

### Quick Links

- **[GitHub Workflows](docs/workflows.md)** - CI/CD automation
- **[GitFlow Versioning](docs/versioning.md)** - GitFlow branching strategy
- **[Contributing Guide](docs/contributing.md)** - Development workflow

---

## Features

### Core Functionality

- **Multi-chain Support** - Connect to any EVM-compatible chain (Ethereum Mainnet, Sepolia Testnet)
- **Smart Contract Integration** - Full Evx protocol contract wrappers (Factory, Pool, Position Manager, Governance)
- **Type-safe Interactions** - Complete TypeScript support with full type definitions
- **Dependency Injection** - Built with TSyringe for clean architecture and testability

### CQRS Architecture

- **Commands** - Write operations for pool creation, swaps, liquidity management, and governance
- **Queries** - Read operations for pool data, positions, quotes, and protocol information
- **Event Listeners** - Real-time blockchain event monitoring for pools, swaps, and governance

### DeFi Operations

- **Pool Management** - Create pools, query pool data, and manage liquidity positions
- **Swap Operations** - Execute exact input/output swaps with slippage protection
- **Liquidity Provision** - Add/remove liquidity with NFT-based position management
- **Flash Loans** - Execute flash loan operations through the PairFlash contract
- **Governance** - Participate in DAO governance with voting and proposal management

### Developer Experience

- **Scoped configuration** - Isolated RPC + chain via `createSdkScope` (multi-request safe)
- **Transaction Monitoring** - Built-in callbacks for transaction lifecycle tracking
- **Error Handling** - Comprehensive error handling with detailed error messages
- **Modular Design** - Import only what you need for optimal bundle size

### Infrastructure

- **Auto-versioning** - GitFlow-based version management
- **Comprehensive Testing** - >80% test coverage with Jest
- **CI/CD Pipeline** - Automated builds, tests, and deployments
- **Documentation** - Complete API documentation and usage examples

---

## Installation

```bash
npm install evx-sdk
# or
yarn add evx-sdk
```

## Usage

### Setup SDK Configuration

Create an isolated scope with your RPC URL and chain ID (preferred for backends and scripts):

```ts
import { createSdkScope } from 'evx-sdk';

const scope = createSdkScope({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  chainId: 11155111 // Sepolia
});

// Use scope.resolve(CommandOrQuery) — call scope.dispose() when done
```

Single-tab browser apps (Evx Web tx builders) use `configureRootChainById` / `configureRootSigner` on the root container instead of product RPC.

### Read pool info directly from blockchain

```ts
import 'reflect-metadata';
import { GetPoolQuery, createSdkScope } from 'evx-sdk';

const scope = createSdkScope({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  chainId: 11155111
});

const getPool = scope.resolve(GetPoolQuery);
const pool = await getPool.execute({
  address: '0x7Fb01B2d918Edcad3d3a05b5B7A511ACA1C66aD8'
});

console.table(pool);
scope.dispose();
```

### Listen to pool events

```ts
import 'reflect-metadata';
import { PoolCreatedListener, createSdkScope } from 'evx-sdk';

async function listenToEvents() {
  const scope = createSdkScope({
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111
  });

  const listener = scope.resolve(PoolCreatedListener);

  await listener.start(async (event) => {
    console.log('New pool created!');
    console.log('Token0:', event.token0);
    console.log('Token1:', event.token1);
    console.log('Fee:', event.fee);
    console.log('Pool Address:', event.pool);
  });
}

listenToEvents();
```

### Execute Commands

Commands are used for write operations that modify the blockchain state. Here are examples of simple and callback-based commands:

#### Simple Command Execution

```ts
import 'reflect-metadata';
import { CreatePoolCommand, createSdkScope } from 'evx-sdk';

async function createPool() {
  const scope = createSdkScope({
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111
  });

  const createPoolCommand = scope.resolve(CreatePoolCommand);

  await createPoolCommand.execute({
    token0: '0xA0b86a33E6eF5d5D8C8F7F1f6e52E8A3', // Token A address
    token1: '0xB1c97a44F7e83B9D8F8F1f6e52E8A3B4', // Token B address
    fee: 3000n // Fee tier (0.3%)
  });

  console.log('Pool created successfully!');
  console.log('Transaction hash:', result.transactionHash);
  console.log('Pool address:', result.poolAddress);
}

createPool();
```

#### Command with Callback for Transaction Monitoring

```ts
import 'reflect-metadata';
import { SwapExactInputSingleCommand, createSdkScope } from 'evx-sdk';

async function executeSwapWithCallback() {
  const scope = createSdkScope({
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111
  });

  const swapCommand = scope.resolve(SwapExactInputSingleCommand);

  await swapCommand.execute({
    tokenIn: '0xA0b86a33E6eF5d5D8C8F7F1f6e52E8A3',
    tokenOut: '0xB1c97a44F7e83B9D8F8F1f6e52E8A3B4',
    fee: 3000,
    recipient: '0xRecipientAddress',
    deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    amountIn: '1000000000000000000', // 1 token (18 decimals)
    amountOutMinimum: '0',
    sqrtPriceLimitX96: 0,
    // Callbacks are part of the parameters object
    onTransaction: (txHash: string) => {
      console.log('Transaction sent:', txHash);
      console.log('Waiting for confirmation...');
    },
    onDone: (receipt: any) => {
      console.log('Swap completed successfully!');
      console.log('Gas used:', receipt.gasUsed.toString());
      console.log('Block number:', receipt.blockNumber);
    },
    onFail: (error: Error) => {
      console.error('Swap failed:', error.message);
    }
  });
}

executeSwapWithCallback();
```

---

## Supported Networks

- Ethereum Mainnet
- Sepolia Testnet
- Add your own in `resources/chains.ts`

---

## Environment Configuration

### Supported Chains

The SDK supports the following networks:

```typescript
import { createSdkScope } from 'evx-sdk';

const sepolia = createSdkScope({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  chainId: 11155111
});

const mainnet = createSdkScope({
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
  chainId: 1
});
```

## Development

### Prerequisites

- Node.js >= 18.19.1
- npm or yarn
- Git

### Setup

```bash
git clone https://github.com/evx-finance/evx-sdk
cd evx-sdk
npm install
```

### Scripts

```bash
npm run build             # Build TypeScript
npm test                  # Run tests
npm run lint              # Check code style
npm run lint:fix          # Fix linting issues
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage report
```

> **Test Coverage**: We maintain >80% test coverage across all modules.

---

## Architecture

The Evx SDK follows the **CQRS (Command Query Responsibility Segregation)** pattern:

```
src/
├── abis/         # Contract ABIs and interfaces
├── commands/     # Write operations (mutations)
├── contracts/    # Smart contract wrappers
├── enums/        # TypeScript enums
├── interfaces/   # TypeScript interfaces and types
├── listeners/    # Event listeners
├── providers/    # RPC and provider management
├── queries/      # Read operations (queries)
├── resources/    # Constants, chains, and configurations
└── utils/        # Utility functions and helpers
```

### Key Patterns

- **Dependency Injection** - Using TSyringe container
- **CQRS** - Separation of read and write operations
- **Single Responsibility** - Each class has one clear purpose
- **Test-Driven** - Comprehensive test coverage

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Workflow

We use **GitFlow** for branch management:

| Branch Type | Purpose        | Example                    |
| ----------- | -------------- | -------------------------- |
| `feature/*` | New features   | `feature/add-swap-command` |
| `bugfix/*`  | Bug fixes      | `bugfix/fix-pool-query`    |
| `hotfix/*`  | Critical fixes | `hotfix/security-patch`    |

> **Learn More**: [Contributing Guide](docs/contributing.md) | [GitFlow Workflow](docs/versioning.md)

---

## Community & Support

### Need Help?

- **Documentation**: Browse the guides above
- **Bug Reports**: [GitHub Issues](https://github.com/evx-finance/evx-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/evx-finance/evx-sdk/discussions)
- **Development**: [Contributing Guide](docs/contributing.md)
- **Contact**: [Team Email](mailto:team@evx.finance)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [Releases](https://github.com/evx-finance/evx-sdk/releases) for version history and changelogs.

**Latest Version**: ![npm](https://img.shields.io/npm/v/evx-sdk)

---

<div align="center">
  
**Built with love by the Evx Finance Team**

[Website](https://evx.finance) • [Twitter](https://twitter.com/evx_finance) • [Discord](https://discord.gg/evx)

</div>
