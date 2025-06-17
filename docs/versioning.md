# GitFlow Versioning Strategy

This document explains how the TypeScript `version-manager.ts` implements versioning following the GitFlow pattern.

## GitFlow Branching Model

The Nebular SDK uses GitFlow branching strategy with automated version management:

```
main ←-- release/X.Y.Z ←-- develop ←-- feature/name
  ↑                          ↑
hotfix/name                bugfix/name
```

## Version Format Pattern

| Branch Type | Version Pattern | Example | Description |
|-------------|----------------|---------|-------------|
| `main` | `X.Y.Z` | `1.2.3` | Stable production release |
| `develop` | `X.(Y+1).0-dev` | `1.3.0-dev` | Development version |
| `feature/*` | `X.(Y+1).0-alpha.N` | `1.3.0-alpha.1` | Feature development |
| `release/*` | `X.Y.Z-rc.N` | `1.3.0-rc.1` | Release candidate |
| `hotfix/*` | `X.Y.Z-hotfix.N` | `1.2.3-hotfix.1` | Production hotfix |
| `bugfix/*` | `X.Y.Z-alpha.N` | `1.2.3-alpha.1` | Bug fix |

## Implementation

The version manager automatically:

1. **Detects branch type** from Git branch name
2. **Reads current version** from package.json
3. **Fetches existing tags** from repository
4. **Calculates next version** based on GitFlow rules
5. **Updates package.json** with new version

## Usage Examples

### Feature Development
```bash
npm run version:update feature/new-api
# Output: 1.3.0-alpha.1 (if current is 1.2.3)
```

### Release Candidate
```bash
npm run version:update release/1.3.0
# Output: 1.3.0-rc.1
```

### Hotfix
```bash
npm run version:update hotfix/critical-fix
# Output: 1.2.3-hotfix.1 (if current is 1.2.3)
```

### Production Release
```bash
npm run version:update main
# Output: 1.2.3 (maintains current stable version)
```

### Development
```bash
npm run version:update develop
# Output: 1.3.0-dev (next minor + dev suffix)
```

## Testing & Simulation

### Simulate Version Changes
```bash
npm run version:simulate feature/test
# Shows what version would be generated without changing package.json
```

### Run All Tests
```bash
npm run version:test
# Runs comprehensive tests for all branch scenarios
```

## Automatic CI/CD Integration

The version manager integrates with GitHub Actions workflows:

```yaml
- name: Update version
  run: npm run version:update ${{ github.ref_name }}

- name: Generate tag name
  id: tag
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "version=$VERSION" >> $GITHUB_OUTPUT
```

## Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `version:update` | Update package.json version | `npm run version:update <branch>` |
| `version:simulate` | Simulate version without changes | `npm run version:simulate <branch>` |
| `version:test` | Run all version manager tests | `npm run version:test` |

## Advanced Features

### Custom Base Version
```bash
# Simulate with specific base version
tsx tools/version-manager.ts --branch feature/test --simulate --base-version 2.0.0
```

### Dry Run Mode
```bash
# See what would happen without making changes
npm run version:simulate feature/new-feature
```

### Branch Auto-detection
```bash
# Automatically detect current branch
npm run version:update
```

## Error Handling

The version manager includes robust error handling for:

- **Invalid branch names** - Clear error messages
- **Missing package.json** - File validation
- **Git repository issues** - Repository checks
- **Network failures** - Graceful degradation

## Related Documentation

- [TypeScript Version Manager](version-manager.md) - Complete API documentation
- [GitHub Workflows](workflows.md) - CI/CD integration
- [Contributing Guide](contributing.md) - Development workflow 