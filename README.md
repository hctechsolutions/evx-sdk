# Nebular SDK

The Nebular SDK is a TypeScript developer toolkit designed to simplify interaction with the Nebular decentralized liquidity protocol. It provides a high-level abstraction over the core smart contracts. Built using a modular CQRS (Command Query Responsibility Segregation) architecture for scalability and clarity.

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Coverage](https://img.shields.io/badge/tests-passing-green)

---

## Documentation

Welcome to the comprehensive documentation for the Nebular SDK. This section contains detailed guides, workflows, and tools documentation.

**[Quick Start](#installation)** | **[Contributing](docs/contributing.md)** | **[Development Tools](#development)**

### Documentation Structure

#### **Getting Started**
| Section | Description | Link |
|---------|-------------|------|
| **Installation** | Quick start guide | [Getting Started](#installation) |
| **Basic Usage** | Your first SDK queries | [Usage Examples](#usage) |
| **Environment Setup** | RPC configuration | [Environment Configuration](#environment-configuration) |

#### **Development Tools**
| Section | Description | Link |
|---------|-------------|------|
| **Version Manager** | Automatic GitFlow versioning | [Version Manager](docs/version-manager.md)
| **GitFlow Versioning** | GitFlow branching strategy | [GitFlow Versioning](docs/versioning.md)
| **GitHub Workflows** | CI/CD automation | [GitHub Workflows](docs/workflows.md)

#### **Deployment**
| Section | Description | Link |
|---------|-------------|------|
| **CI/CD Pipeline** | Automated builds and releases | [CI/CD Pipeline](docs/workflows.md)

#### **Contributing**
| Section | Description | Link |
|---------|-------------|------|
| **Contributing Guide** | How to contribute | [Contributing Guide](docs/contributing.md)

### Quick Links

- **[Version Manager](docs/version-manager.md)** - Automatic GitFlow versioning
- **[GitHub Workflows](docs/workflows.md)** - CI/CD automation
- **[GitFlow Versioning](docs/versioning.md)** - GitFlow branching strategy
- **[Contributing Guide](docs/contributing.md)** - Development workflow

---

## Features

* Connect to any EVM-compatible chain (Mainnet, Sepolia)
* Simple configuration with `setRPCProvider` and `setAllChain`
* CQRS-based structure (`commands`, `queries`)
* Minimal and typed interaction with contracts (ethers.js)
* Query pools and token pairs with ease
* Real-time event listening capabilities
* Auto-versioning with GitFlow
* Comprehensive test coverage
* CI/CD automation

---

## Installation

```bash
npm install @nebular/sdk
# or
yarn add @nebular/sdk
```

## Usage

### Setup SDK Configuration

Before using any SDK functionality, you need to configure the RPC provider and chain:

```ts
import { setRPCProvider, setAllChain } from '@nebular/sdk';

// Configure RPC provider and chain
await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
await setAllChain('sepolia'); // or 'mainnet'
```

### Read pool info directly from blockchain

```ts
import { GetPoolQuery, setRPCProvider, setAllChain } from '@nebular/sdk';
import { container } from 'tsyringe';

// Setup SDK configuration
await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
await setAllChain('sepolia');

// Query pool information
const getPool = container.resolve(GetPoolQuery);
const pool = await getPool.execute({ 
  address: '0x7Fb01B2d918Edcad3d3a05b5B7A511ACA1C66aD8' 
});

console.table(pool);
```

### Query multiple pools

```ts
import { GetPoolsQuery, setRPCProvider, setAllChain } from '@nebular/sdk';
import { container } from 'tsyringe';

// Setup SDK configuration
await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
await setAllChain('sepolia');

// Query multiple pools
const getPools = container.resolve(GetPoolsQuery);
const pools = await getPools.execute({
  token0: '0xA0b86a33E6441E7C9f1E8d33c3B6C7D8B3B9E1FE',
  token1: '0xB0b86a33E6441E7C9f1E8d33c3B6C7D8B3B9E1FE'
});

console.log('Found pools:', pools);
```

### Listen to pool events

```ts
import { PoolCreatedListener, setRPCProvider, setAllChain } from '@nebular/sdk';
import { container } from 'tsyringe';

async function listenToEvents() {
  // Setup SDK configuration
  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');

  // Start listening for pool creation events
  const listener = container.resolve(PoolCreatedListener);
  
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

---

## Supported Networks

* Ethereum Mainnet
* Sepolia Testnet
* Add your own in `resources/chains.ts`

---

## Environment Configuration

### Supported Chains

The SDK supports the following networks:

```typescript
import { setRPCProvider, setAllChain } from '@nebular/sdk';

// Sepolia Testnet
await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
await setAllChain('sepolia');

// Ethereum Mainnet
await setRPCProvider('https://mainnet.infura.io/v3/YOUR_KEY');
await setAllChain('mainnet');
```

## Development

### Prerequisites

- Node.js >= 18.19.1
- npm or yarn
- Git

### Setup

```bash
git clone https://github.com/nebular-finance/nebular-sdk
cd nebular-sdk
npm install
```

### Scripts

```bash
npm run build      # Build TypeScript
npm test           # Run tests
npm run lint       # Check code style
npm run lint:fix   # Fix linting issues

# Version management
npm run version:update    # Update version based on branch
npm run version:simulate  # Simulate version update
npm run version:test      # Test version manager
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

The Nebular SDK follows the **CQRS (Command Query Responsibility Segregation)** pattern:

```
src/
├── commands/     # Write operations (mutations)
├── queries/      # Read operations (queries)
├── listeners/    # Event listeners
└── resources/    # Constants, types, configs
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

| Branch Type | Purpose | Example |
|-------------|---------|---------|
| `feature/*` | New features | `feature/add-swap-command` |
| `bugfix/*` | Bug fixes | `bugfix/fix-pool-query` |
| `hotfix/*` | Critical fixes | `hotfix/security-patch` |

> **Learn More**: [Contributing Guide](docs/contributing.md) | [GitFlow Workflow](docs/versioning.md)

---

## Community & Support

### Need Help?

- **Documentation**: Browse the guides above
- **Bug Reports**: [GitHub Issues](https://github.com/nebular-finance/nebular-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nebular-finance/nebular-sdk/discussions)
- **Development**: [Contributing Guide](docs/contributing.md)
- **Contact**: [Team Email](mailto:team@nebular.finance)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [Releases](https://github.com/nebular-finance/nebular-sdk/releases) for version history and changelogs.

**Latest Version**: ![npm](https://img.shields.io/npm/v/@nebular/sdk)

---

<div align="center">
  
**Built with love by the Nebular Finance Team**

[Website](https://nebular.finance) • [Twitter](https://twitter.com/nebular_finance) • [Discord](https://discord.gg/nebular)

</div>
