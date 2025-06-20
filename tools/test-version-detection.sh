#!/bin/bash

# Script para testar a detecção de commits de versão
# Simula a lógica usada no workflow de CI

echo "🧪 Testando Detecção de Commits de Versão"
echo "========================================="

test_commit() {
    local commit_message="$1"
    local test_name="$2"
    
    echo ""
    echo "📋 Teste: $test_name"
    echo "Commit: '$commit_message'"
    
    # Simula a lógica do workflow
    if [[ "$commit_message" == *"chore: update version to"* ]]; then
        echo "Resultado: ❌ Version commit detected - SKIP"
        echo "Ação: Version management será pulado"
    else
        echo "Resultado: ✅ Regular commit - PROCEED"
        echo "Ação: Version management será executado"
    fi
}

# Testes
test_commit "feat: add new feature" "Commit normal"
test_commit "chore: update version to 1.1.0-rc.2" "Commit de versão"
test_commit "fix: bug in version manager" "Commit de fix"
test_commit "chore: update version to 2.0.0" "Commit de versão diferente"
test_commit "docs: update README" "Commit de documentação"

echo ""
echo "🎯 Resumo:"
echo "✅ Commits normais: Version management executa"
echo "❌ Commits de versão: Version management é pulado"
echo ""
echo "🚀 Para testar com commit real:"
echo "   git log -1 --pretty=format:'%s' | xargs -I {} bash -c 'echo \"Commit: {}\"; if [[ \"{}\" == *\"chore: update version to\"* ]]; then echo \"SKIP\"; else echo \"PROCEED\"; fi'" 