# Nebular SDK

The Nebular SDK is a TypeScript developer toolkit designed to simplify interaction with the Nebular decentralized liquidity protocol. It provides a high-level abstraction over the core smart contracts. Built using a modular CQRS (Command Query Responsibility Segregation) architecture for scalability and clarity.

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Coverage](https://img.shields.io/badge/tests-passing-green)

---

## 📚 Documentation

Welcome to the comprehensive documentation for the Nebular SDK. This section contains detailed guides, workflows, and tools documentation.

**🚀 [Quick Start](#installation)** | **🤝 [Contributing](docs/contributing.md)** | **🔧 [Development Tools](#development)**

### 📋 Documentation Structure

#### 🚀 **Getting Started**
| Section | Description | Link |
|---------|-------------|------|
| 🚀 **Installation** | Quick start guide | [Getting Started](#installation) |
| 🔧 **Basic Usage** | Your first SDK queries | [Usage Examples](#usage) |
| ⚙️ **Environment Setup** | RPC configuration | [Environment Configuration](#environment-configuration) |

#### 🔧 **Development Tools**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| 📦 **Version Manager** | Automatic GitFlow versioning | [Version Manager](docs/version-manager.md) | ✅ Complete |
| 🔀 **GitFlow Versioning** | GitFlow branching strategy | [GitFlow Versioning](docs/versioning.md) | ✅ Complete |
| 🏃‍♂️ **GitHub Workflows** | CI/CD automation | [GitHub Workflows](docs/workflows.md) | ✅ Complete |

#### 🏗️ **Architecture**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| 📝 **CQRS Pattern** | Command Query Responsibility Segregation | [CQRS Pattern](docs/architecture/cqrs.md) | 🚧 In Progress |
| 📁 **Project Structure** | Directory organization | [Project Structure](docs/architecture/structure.md) | 🚧 In Progress |
| 🔧 **Dependency Injection** | TSyringe container usage | [Dependency Injection](docs/architecture/di.md) | 🚧 In Progress |

#### 🧪 **Testing**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| 🏗️ **Test Structure** | Jest configuration and patterns | [Test Structure](docs/testing/structure.md) | 🚧 In Progress |
| ✍️ **Writing Tests** | Best practices | [Writing Tests](docs/testing/writing-tests.md) | 🚧 In Progress |
| 📊 **Coverage Reports** | Understanding test coverage | [Coverage Reports](docs/testing/coverage.md) | 🚧 In Progress |

#### 🚀 **Deployment**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| 🔄 **CI/CD Pipeline** | Automated builds and releases | [CI/CD Pipeline](docs/workflows.md) | ✅ Complete |
| 📦 **NPM Publishing** | Package publication | [NPM Publishing](docs/deployment/npm.md) | 📋 Planned |
| 🏷️ **GitHub Releases** | Release management | [GitHub Releases](docs/deployment/releases.md) | 📋 Planned |

#### 🤝 **Contributing**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| 🤝 **Contributing Guide** | How to contribute | [Contributing Guide](docs/contributing.md) | ✅ Complete |
| 🎨 **Code Style** | Coding standards | [Code Style](docs/contributing/style.md) | 📋 Planned |
| 🔄 **Pull Request Process** | PR workflow | [Pull Request Process](docs/contributing/pr-process.md) | 📋 Planned |

#### 📋 **API Reference**
| Section | Description | Link | Status |
|---------|-------------|------|--------|
| ⚡ **Commands** | Available commands | [Commands](docs/api/commands.md) | 📋 Planned |
| 🔍 **Queries** | Available queries | [Queries](docs/api/queries.md) | 📋 Planned |
| 📝 **Types** | TypeScript definitions | [Types](docs/api/types.md) | 📋 Planned |
| 🌐 **Chains** | Supported networks | [Chains](docs/api/chains.md) | 📋 Planned |

> **Documentation Status Legend**: ✅ Complete | 🚧 In Progress | 📋 Planned

### 🔗 Quick Links

- **[Version Manager](docs/version-manager.md)** - Automatic GitFlow versioning
- **[GitHub Workflows](docs/workflows.md)** - CI/CD automation
- **[GitFlow Versioning](docs/versioning.md)** - GitFlow branching strategy
- **[Contributing Guide](docs/contributing.md)** - Development workflow

---

## Features

* 🌐 Connect to any EVM-compatible chain
* 🏗️ CQRS-based structure (`commands`, `queries`)
* 🔗 Minimal and typed interaction with contracts (ethers.js)
* 🔍 Query pools and token pairs with ease
* ⚡ Auto-versioning with GitFlow
* 🧪 Comprehensive test coverage
* 📦 CI/CD automation

---

## Installation

```bash
npm install @nebular/sdk
# or
yarn add @nebular/sdk
```

## Usage

### Read pool info directly from blockchain

```ts
import { GetPoolQuery } from '@nebular/sdk/queries';
import { container } from 'tsyringe';

const getPool = container.resolve(GetPoolQuery);

const pool = await getPool.execute({ 
  address: '0x7Fb01B2d918Edcad3d3a05b5B7A511ACA1C66aD8' 
})

console.table(pool)
```

### Query multiple pools

```ts
import { GetPoolsQuery } from '@nebular/sdk/queries';

const getPools = container.resolve(GetPoolsQuery);
const pools = await getPools.execute({
  token0: '0xA0b86a33E6441E7C9f1E8d33c3B6C7D8B3B9E1FE',
  token1: '0xB0b86a33E6441E7C9f1E8d33c3B6C7D8B3B9E1FE'
});
```

### Listen to pool events

```ts
import { PoolCreatedListener } from '@nebular/sdk/listeners';

const listener = container.resolve(PoolCreatedListener);
await listener.start();

listener.on('poolCreated', (pool) => {
  console.log('New pool created:', pool);
});
```

---

## Supported Networks

* 🌐 Ethereum Mainnet
* 🧪 Sepolia Testnet
* ⚙️ Add your own in `resources/chains.ts`

---

## Environment Configuration

Create a `.env` file:

```env
CHAIN=mainnet
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

### Supported Chains

```typescript
// Available chains
const chains = {
  mainnet: 'https://mainnet.infura.io/v3/YOUR_KEY',
  sepolia: 'https://sepolia.infura.io/v3/YOUR_KEY',
  // Add custom chains...
}
```

---

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
npm test          # Run tests
npm run lint      # Check code style
npm run lint:fix  # Fix linting issues

# Version management
npm run version:update    # Update version based on branch
npm run version:simulate  # Simulate version update
npm run version:test     # Test version manager
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage report
```

> **📊 Test Coverage**: We maintain >80% test coverage across all modules.

---

## Architecture

The Nebular SDK follows the **CQRS (Command Query Responsibility Segregation)** pattern:

```
src/
├── commands/     # Write operations (mutations)
├── queries/      # Read operations (queries)
├── listeners/    # Event listeners
├── resources/    # Constants, types, configs
└── services/     # Shared services
```

### Key Patterns

- **🔧 Dependency Injection** - Using TSyringe container
- **📝 CQRS** - Separation of read and write operations
- **🎯 Single Responsibility** - Each class has one clear purpose
- **🧪 Test-Driven** - Comprehensive test coverage

> **📖 Learn More**: [Architecture Guide](docs/architecture/cqrs.md)

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

> **📖 Learn More**: [Contributing Guide](docs/contributing.md) | [GitFlow Workflow](docs/versioning.md)

---

## Community & Support

### 🆘 Need Help?

- **📖 Documentation**: Browse the guides above
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/nebular-finance/nebular-sdk/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/nebular-finance/nebular-sdk/discussions)
- **🔧 Development**: [Contributing Guide](docs/contributing.md)
- **📧 Contact**: [Team Email](mailto:team@nebular.finance)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [Releases](https://github.com/nebular-finance/nebular-sdk/releases) for version history and changelogs.

**Latest Version**: ![npm](https://img.shields.io/npm/v/@nebular/sdk)

---

<div align="center">
  
**Built with ❤️ by the Nebular Finance Team**

[Website](https://nebular.finance) • [Twitter](https://twitter.com/nebular_finance) • [Discord](https://discord.gg/nebular)

</div>
