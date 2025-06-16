# TypeScript Version Manager

Este é um version manager em TypeScript que implementa o padrão GitFlow para automatizar o versionamento do `package.json` baseado na branch atual e tags existentes.

## 🚀 Funcionalidades

- ✅ **Versionamento automático** baseado na branch GitFlow
- ✅ **Atualização do package.json** preservando outros campos
- ✅ **Modo simulação** para testes
- ✅ **Suporte a Git tags** ou tags personalizadas
- ✅ **Interface CLI** completa
- ✅ **Testes abrangentes** incluídos

## 📦 Instalação

O version manager já está configurado no projeto. As dependências necessárias já estão instaladas:

- `tsx` - Para executar TypeScript diretamente
- `@types/node` - Types do Node.js

## 🎯 Scripts NPM

```bash
# Testar o version manager
npm run version:test

# Simular atualização de versão (não modifica arquivos)
npm run version:simulate <branch-name>

# Atualizar versão do package.json
npm run version:update <branch-name>
```

## 📝 Exemplos de Uso

### 1. Modo Simulação (Recomendado para testes)

```bash
# Simular versão para branch main
npm run version:simulate main
# Output: [SIMULATE] Would update version from 1.0.0 to 1.0.0

# Simular versão para develop
npm run version:simulate develop  
# Output: [SIMULATE] Would update version from 1.0.0 to 1.1.0-dev

# Simular versão para feature
npm run version:simulate feature/new-api
# Output: [SIMULATE] Would update version from 1.0.0 to 1.1.0-alpha.1
```

### 2. Atualização Real do package.json

```bash
# Atualizar versão para develop (modifica package.json)
npm run version:update develop
# Output: ✅ Updated package.json version: 1.0.0 -> 1.1.0-dev

# Atualizar versão para release
npm run version:update release/1.2.0
# Output: ✅ Updated package.json version: 1.0.0 -> 1.2.0-rc.1
```

### 3. Uso Direto com TSX

```bash
# Simulação com tags customizadas
tsx tools/version-manager.ts --simulate --branch feature/test --tags '["1.2.3", "1.3.0-alpha.1"]'

# Atualização real
tsx tools/version-manager.ts --branch main

# Especificar caminho do package.json
tsx tools/version-manager.ts --branch develop --package-path ./custom/package.json
```

## 🏷️ Padrão de Versionamento

| Branch Type | Formato Gerado | Exemplo |
|-------------|----------------|---------|
| `main` | `X.Y.Z` | `1.2.3` |
| `develop` | `X.(Y+1).0-dev` | `1.3.0-dev` |
| `feature/name` | `X.(Y+1).0-alpha.N` | `1.3.0-alpha.1` |
| `release/X.Y.Z` | `X.Y.Z-rc.N` | `1.3.0-rc.1` |
| `hotfix/name` | `X.Y.Z-hotfix.N` | `1.2.3-hotfix.1` |
| `bugfix/name` | `X.Y.Z-alpha.N` | `1.2.3-alpha.1` |

## 🧪 Executar Testes

```bash
# Executar todos os testes do version manager
npm run version:test

# Output esperado:
# 🧪 Running TypeScript Version Manager Tests
# ✅ Main branch
# ✅ Develop branch  
# ✅ Feature branch
# ✅ Release branch
# ✅ Hotfix branch
# ✅ Bugfix branch
# ✅ No existing tags
# ✅ Unknown branch
# 🎉 All tests passed!
```

## 🔧 API Programática

```typescript
import { VersionManager } from './tools/version-manager';

// Criar instância do version manager
const manager = new VersionManager({
  branch: 'feature/new-api',
  packagePath: './package.json',  // opcional
  simulate: false,                // opcional
  tags: ['1.2.3', '1.3.0-rc.1'], // opcional
  useGitTags: true               // opcional (padrão: true)
});

// Gerar nova versão
const newVersion = manager.generateVersion();
console.log(newVersion); // "1.3.0-alpha.1"

// Atualizar package.json
const { oldVersion, newVersion } = manager.updatePackageVersion();
console.log(`${oldVersion} -> ${newVersion}`);

// Obter versão atual
const currentVersion = manager.getCurrentVersion();
```

## ⚙️ Opções de Configuração

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `branch` | `string` | **obrigatório** | Nome da branch atual |
| `packagePath` | `string` | `./package.json` | Caminho para o package.json |
| `simulate` | `boolean` | `false` | Modo simulação (não modifica arquivos) |
| `tags` | `string[]` | `[]` | Tags customizadas (para testes) |
| `useGitTags` | `boolean` | `true` | Usar tags do Git ou tags customizadas |

## 🔄 Integração com CI/CD

### GitHub Actions

```yaml
name: Update Version
on:
  push:
    branches: [ main, develop, 'feature/*', 'release/*', 'hotfix/*' ]

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run version:update ${{ github.ref_name }}
      
      - name: Commit version change
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add package.json
          git commit -m "chore: update version to $(node -p "require('./package.json').version")" || exit 0
          git push
```

### GitLab CI

```yaml
update-version:
  stage: version
  script:
    - npm install
    - npm run version:update $CI_COMMIT_REF_NAME
    - git add package.json
    - git commit -m "chore: update version" || true
    - git push origin $CI_COMMIT_REF_NAME
  only:
    - main
    - develop
    - /^feature\/.*$/
    - /^release\/.*$/
    - /^hotfix\/.*$/
```

## 🚀 Vantagens do Version Manager TypeScript

| Característica | Benefício |
|----------------|-----------|
| **Linguagem Nativa** | TypeScript/Node.js (alinhado com o projeto) |
| **Performance** | ~500ms (muito mais rápido) |
| **Integração** | Atualiza package.json diretamente |
| **Facilidade** | Scripts NPM integrados |
| **Testes** | Suite de testes abrangente |
| **API** | Interface programática + CLI |
| **Dependências** | Zero dependências externas |
| **Manutenção** | Usa Git tags (sem AWS) |

## 🛠️ Desenvolvimento

Para modificar o version manager:

1. **Edite** `tools/version-manager.ts`
2. **Teste** com `npm run version:test`
3. **Valide** com `npm run version:simulate <branch>`
4. **Aplique** com `npm run version:update <branch>`

## 📋 Checklist de Validação

- [ ] ✅ Testes passando (`npm run version:test`)
- [ ] ✅ Simulação funcionando (`npm run version:simulate main`)
- [ ] ✅ Atualização funcionando (`npm run version:update develop`)
- [ ] ✅ Package.json preserva outros campos
- [ ] ✅ Versões seguem padrão GitFlow
- [ ] ✅ Sufixos incrementam corretamente 