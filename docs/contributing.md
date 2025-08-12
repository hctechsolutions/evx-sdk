# Contributing to Evx SDK

Thank you for your interest in contributing to the Evx SDK! This guide will help you get started with contributing to the project.

## Quick Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/evx-sdk.git
   cd evx-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start developing**
   ```bash
   npm run test:watch  # Run tests in watch mode
   ```

## GitFlow Workflow

We use GitFlow for branch management. All contributions should follow this pattern:

### Branch Types

| Branch Type | Purpose | Example |
|-------------|---------|---------|
| `feature/*` | New features | `feature/add-swap-command` |
| `bugfix/*` | Bug fixes | `bugfix/fix-pool-query` |
| `hotfix/*` | Critical fixes | `hotfix/security-patch` |
| `release/*` | Release preparation | `release/1.2.0` |

### Workflow Steps

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint    # Check code style
   npm test        # Run all tests
   npm run build   # Ensure it builds
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new swap command functionality"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request to `develop` branch.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(queries): add GetPoolQuery for pool information
fix(commands): resolve circular dependency in SwapCommand
docs: update README with new installation instructions
test: add unit tests for PoolCreatedListener
```

## Testing Guidelines

### Writing Tests

1. **File naming**: `*.test.ts` or `*.spec.ts`
2. **Location**: Mirror the `src/` structure in `tests/`
3. **Coverage**: Aim for >80% code coverage

### Test Structure
```typescript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('when condition', () => {
    it('should behave as expected', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage
```

## Coding Standards

### TypeScript Guidelines

1. **Use strict typing**
   ```typescript
   // ✅ Good
   function processPool(pool: Pool): ProcessedPool {
     return { ...pool, processed: true };
   }

   // ❌ Bad
   function processPool(pool: any): any {
     return { ...pool, processed: true };
   }
   ```

2. **Use dependency injection**
   ```typescript
   // ✅ Good
   @injectable()
   export class GetPoolQuery {
     constructor(
       @inject("ProviderService") private provider: ProviderService
     ) {}
   }
   ```

3. **Follow CQRS pattern**
   - Commands: Write operations
   - Queries: Read operations
   - Separate concerns clearly

### Code Organization

```
src/
├── commands/          # Write operations
├── queries/           # Read operations
├── listeners/         # Event listeners
└── resources/         # Constants, types, configs
```

### ESLint & Prettier

We use ESLint and Prettier for code formatting:

```bash
npm run lint           # Check linting
npm run lint:fix       # Auto-fix issues
```

## Code Review Process

### Before Submitting PR

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if needed)
- [ ] Version manager tests pass (`npm run version:test`)

### PR Requirements

1. **Clear description** of changes
2. **Link to related issues**
3. **Screenshots** (if applicable)
4. **Breaking changes** noted
5. **Tests** for new functionality

### Review Checklist

Reviewers will check:
- [ ] Code follows project standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance implications considered

## Reporting Issues

### Bug Reports

Include:
- **Environment** (Node.js version, OS)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Code example** (minimal reproduction)
- **Error messages** (full stack trace)

### Feature Requests

Include:
- **Use case** description
- **Proposed solution**
- **Alternative solutions** considered
- **Impact** on existing functionality

## Release Process

Only maintainers handle releases:

1. Create `release/X.Y.Z` branch from `develop`
2. Update version and changelog
3. Merge to `main` (creates tag and release)
4. Merge back to `develop`

## Additional Resources

- [Project Architecture](architecture/structure.md)
- [CQRS Pattern Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/cqrs-pattern.html)
- [Version Manager](version-manager.md)
- [GitHub Workflows](workflows.md)

## Community

- [GitHub Discussions](https://github.com/evx-finance/evx-sdk/discussions)
- [Discord Server](https://discord.gg/evx) (coming soon)
- [Twitter](https://twitter.com/evx_finance)

---

Thank you for contributing to Evx SDK! 