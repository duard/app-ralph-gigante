#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`📋 ${title}`, colors.blue)
  log(`${'='.repeat(60)}`, colors.cyan)
}

function runCommand(command, description) {
  logSection(description)

  try {
    log(`🚀 Executando: ${command}`, colors.yellow)
    const startTime = Date.now()

    const result = execSync(command, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname),
      encoding: 'utf8',
    })

    const duration = Date.now() - startTime
    log(`✅ Concluído em ${duration}ms`, colors.green)
    return { success: true, duration }
  } catch (error) {
    log(`❌ Falha ao executar: ${error.message}`, colors.red)
    return { success: false, error: error.message }
  }
}

function main() {
  logSection('INICIANDO SUÍTE DE TESTES DO SERVIÇO DE CONSUMO')
  log('🎯 Objetivo: Validar funcionalidades do consumo V2', colors.blue)
  log('📁 Projeto: api-sankhya-center', colors.blue)
  log('📅 Data/Hora: ' + new Date().toLocaleString('pt-BR'), colors.blue)

  const results = {
    lint: null,
    unit: null,
    integration: null,
    coverage: null,
  }

  // 1. ESLint
  results.lint = runCommand(
    'npx eslint src/sankhya/tgfpro/consumo/**/*.ts --ext .ts',
    '🔍 Executando ESLint (verificação de código)',
  )

  // 2. Testes Unitários
  results.unit = runCommand(
    'npm test -- --testPathPattern=consumo.*\\.spec\\.ts$ --verbose',
    '🧪 Executando testes unitários do serviço de consumo',
  )

  // 3. Testes de Integração (se existirem)
  results.integration = runCommand(
    'npm run test:e2e -- --testPathPattern=consumo.*\\.e2e-spec\\.ts$ --verbose',
    '🔗 Executando testes de integração (se existirem)',
  )

  // 4. Coverage (cobertura de código)
  results.coverage = runCommand(
    'npm test -- --coverage --testPathPattern=consumo.*\\.spec\\.ts$ --coverageReporters=text-lcov | coverage-summary-coverage',
    '📊 Gerando relatório de cobertura de código',
  )

  // Relatório final
  logSection('📈 RELATÓRIO FINAL')

  const totalTests = Object.values(results).filter((r) => r !== null).length
  const passedTests = Object.values(results).filter(
    (r) => r && r.success,
  ).length
  const failedTests = totalTests - passedTests

  log(`📋 Total de verificações: ${totalTests}`, colors.blue)
  log(`✅ Bem-sucedidas: ${passedTests}`, colors.green)

  if (failedTests > 0) {
    log(`❌ Falharam: ${failedTests}`, colors.red)
  }

  log(
    `📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
    passedTests === totalTests ? colors.green : colors.yellow,
  )

  // Detalhes por categoria
  log('\n📝 Detalhes por categoria:', colors.blue)

  if (results.lint) {
    log(
      `   🔍 ESLint: ${results.lint.success ? '✅ Passou' : '❌ Falhou'}`,
      results.lint.success ? colors.green : colors.red,
    )
    if (results.lint.duration) {
      log(`      ⏱️  Duração: ${results.lint.duration}ms`, colors.yellow)
    }
  }

  if (results.unit) {
    log(
      `   🧪 Testes Unitários: ${results.unit.success ? '✅ Passou' : '❌ Falhou'}`,
      results.unit.success ? colors.green : colors.red,
    )
    if (results.unit.duration) {
      log(`      ⏱️  Duração: ${results.unit.duration}ms`, colors.yellow)
    }
  }

  if (results.integration) {
    log(
      `   🔗 Testes Integração: ${results.integration.success ? '✅ Passou' : '❌ Falhou'}`,
      results.integration.success ? colors.green : colors.red,
    )
    if (results.integration.duration) {
      log(`      ⏱️  Duração: ${results.integration.duration}ms`, colors.yellow)
    }
  }

  if (results.coverage) {
    log(
      `   📊 Cobertura: ${results.coverage.success ? '✅ Gerada' : '❌ Falhou'}`,
      results.coverage.success ? colors.green : colors.red,
    )
    if (results.coverage.duration) {
      log(`      ⏱️  Duração: ${results.coverage.duration}ms`, colors.yellow)
    }
  }

  // Recomendações
  if (failedTests > 0) {
    logSection('💡 RECOMENDAÇÕES')

    if (!results.lint.success) {
      log('• Reviste os erros de lint/código estático', colors.yellow)
      log('• Execute: npm run lint:fix', colors.cyan)
    }

    if (!results.unit.success) {
      log('• Verifique os testes unitários que falharam', colors.yellow)
      log(
        '• Execute individualmente: npm test -- --testNamePattern="nome_do_teste"',
        colors.cyan,
      )
    }

    if (!results.integration.success) {
      log('• Verifique se o ambiente de teste está configurado', colors.yellow)
      log('• Confirme se os serviços externos estão acessíveis', colors.cyan)
    }

    if (!results.coverage.success) {
      log(
        '• Verifique a configuração de cobertura no jest.config.js',
        colors.yellow,
      )
    }
  }

  // Status final
  logSection('🏁 STATUS FINAL')

  if (failedTests === 0) {
    log('🎉 TODOS OS TESTES PASSARAM!', colors.green)
    log('📦 O serviço de consumo está pronto para deploy', colors.green)
    log('✅ Código validado, testado e com boa cobertura', colors.green)
    process.exit(0)
  } else {
    log('⚠️  EXISTEM FALHAS QUE PRECISAM SER CORRIGIDAS', colors.red)
    log('🔧 Corrija os problemas antes de prosseguir', colors.yellow)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { runCommand, main }
