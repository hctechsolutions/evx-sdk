# GitHub Workflows

This directory contains the GitHub Actions workflows for the Evex SDK.

## Available Workflows

### `ci.yml` - Main CI/CD Pipeline

**Triggers:**
- Push to branches: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`, `bugfix/*`
- Pull requests to: `main`, `develop`

**Jobs:**
1. **test** - Runs linting and tests with coverage
2. **build** - Compiles the TypeScript project
3. **version** - Manages automatic versioning using GitFlow
4. **security** - Security audit (main branch only)

**Features:**
- ✅ Linting with ESLint
- ✅ Complete tests with Jest
- ✅ Coverage upload to Codecov
- ✅ TypeScript build
- ✅ Automatic versioning with GitFlow
- ✅ Automatic tag creation
- ✅ NPM security audit

### `pr.yml` - Pull Request Validation

**Triggers:**
- Pull requests to: `main`, `develop`
- Types: `opened`, `synchronize`, `reopened`

**Jobs:**
1. **validate** - Complete PR validation
2. **size-check** - Bundle size verification
3. **comment-pr** - Automatic PR comments

**Features:**
- ✅ Linting and tests
- ✅ Build verification
- ✅ Version manager testing
- ✅ package.json format validation
- ✅ Bundle size verification
- ✅ Automatic status comments

### `release.yml` - Release Publishing

**Triggers:**
- Push tags in format `v*` (e.g., v1.0.0, v1.2.3)

**Jobs:**
1. **create-release** - Creates GitHub release
2. **publish-npm** - Publishes to NPM (stable releases only)
3. **notify** - Success notifications

**Features:**
- ✅ Automatic GitHub release creation
- ✅ Automatic changelog based on commits
- ✅ Build artifacts upload
- ✅ NPM publishing (stable releases)
- ✅ Status notifications

## Required Secrets

For the workflows to function completely, configure the following secrets in the repository:

### Optional (for advanced features):
- `CODECOV_TOKEN` - Token for coverage upload
- `NPM_TOKEN` - Token for NPM publishing

### Automatic (provided by GitHub):
- `GITHUB_TOKEN` - Used automatically for GitHub operations

## GitFlow Branching Strategy

The workflows automatically implement GitFlow strategy:

| Branch Type | Generated Version | Action |
|-------------|------------------|--------|
| `main` | `X.Y.Z` | Stable release + tag |
| `develop` | `X.(Y+1).0-dev` | Development version |
| `feature/*` | `X.(Y+1).0-alpha.N` | Alpha version for features |
| `release/*` | `X.Y.Z-rc.N` | Release candidate + tag |
| `hotfix/*` | `X.Y.Z-hotfix.N` | Hotfix |
| `bugfix/*` | `X.Y.Z-alpha.N` | Bugfix |

## How to Use

### For Development:
1. Create a `feature/feature-name` branch
2. Make your commits
3. Push will trigger tests and automatic versioning
4. Create PR to `develop`

### For Release:
1. Create `release/X.Y.Z` branch from `develop`
2. Push will generate version `X.Y.Z-rc.N`
3. Merge to `main` will create tag and release

### For Hotfix:
1. Create `hotfix/fix-name` branch from `main`
2. Push will generate version `X.Y.Z-hotfix.N`
3. Merge to `main` and `develop`

## Troubleshooting

### Tests failing:
```bash
npm run test
npm run lint
```

### Build failing:
```bash
npm run build
```

### Version manager issues:
```bash
npm run version:test
npm run version:simulate <branch-name>
```

### Manual tag creation:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Additional Documentation

- [Version Manager TypeScript](version-manager.md)
- [GitFlow Versioning](versioning.md)
- [Contributing Guide](contributing.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 