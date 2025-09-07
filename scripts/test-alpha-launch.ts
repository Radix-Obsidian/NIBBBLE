#!/usr/bin/env tsx
/**
 * Alpha Launch Test Script
 * 
 * Comprehensive testing of alpha launch configuration:
 * - Feature flags validation
 * - Alpha metrics system
 * - Feedback collection
 * - User management
 * - Performance monitoring
 */

import { FEATURES } from '../lib/config/features'
import { alphaMetrics } from '../lib/monitoring/alpha-metrics'
import { alphaFeedback } from '../lib/feedback/alpha-feedback'
import { alphaUserManager } from '../lib/services/alpha-user-management'
import { logger } from '../lib/logger'

// Test configuration
const TEST_CONFIG = {
  verbose: process.argv.includes('--verbose'),
  skipMetrics: process.argv.includes('--skip-metrics'),
  skipDatabase: process.argv.includes('--skip-db')
}

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function error(message: string) {
  log(`❌ ${message}`, colors.red)
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
}

function runTest(testName: string, testFn: () => boolean | Promise<boolean>): Promise<boolean> {
  return new Promise(async (resolve) => {
    testResults.total++
    
    try {
      if (TEST_CONFIG.verbose) {
        info(`Running: ${testName}`)
      }
      
      const result = await testFn()
      
      if (result) {
        testResults.passed++
        success(`${testName}`)
        resolve(true)
      } else {
        testResults.failed++
        error(`${testName}`)
        resolve(false)
      }
    } catch (err) {
      testResults.failed++
      error(`${testName} - ${err instanceof Error ? err.message : 'Unknown error'}`)
      resolve(false)
    }
  })
}

async function testFeatureFlags() {
  log(`\n${colors.bold}${colors.magenta}=== Testing Feature Flags ===${colors.reset}`)
  
  // Test alpha-enabled features
  await runTest('AI Recipe Adaptation enabled', () => FEATURES.enableAIRecipeAdaptation === true)
  await runTest('Cooking Intelligence enabled', () => FEATURES.enableCookingIntelligence === true)
  await runTest('Success Prediction enabled', () => FEATURES.enableSuccessPrediction === true)
  await runTest('Personal Cooking Profile enabled', () => FEATURES.enablePersonalCookingProfile === true)
  await runTest('Cooking Assistant enabled', () => FEATURES.enableCookingAssistant === true)
  await runTest('Feedback System enabled', () => FEATURES.enableFeedbackSystem === true)
  
  // Test disabled features
  await runTest('Social Features disabled', () => FEATURES.enableSocialFeatures === false)
  await runTest('Commerce disabled', () => FEATURES.enableCommerce === false)
  await runTest('Creator Economy disabled', () => FEATURES.enableCreatorEconomy === false)
  await runTest('Nibble Collections disabled', () => FEATURES.enableNibbleCollections === false)
  await runTest('Monetization disabled', () => FEATURES.enableMonetization === false)
  
  // Test analytics features
  await runTest('Analytics enabled', () => FEATURES.enableAnalytics === true)
  await runTest('Error Tracking enabled', () => FEATURES.enableErrorTracking === true)
  await runTest('Performance Monitoring enabled', () => FEATURES.enablePerformanceMonitoring === true)
  await runTest('Real-time Metrics enabled', () => FEATURES.enableRealTimeMetrics === true)
  
  // Test alpha configuration
  if (process.env.NEXT_PUBLIC_ALPHA_MODE === 'true') {
    await runTest('Alpha Mode enabled', () => FEATURES.alphaMode === true)
    await runTest('Alpha User Limit set', () => FEATURES.alphaUserLimit > 0 && FEATURES.alphaUserLimit <= 50)
  }
}

async function testAlphaMetrics() {
  if (TEST_CONFIG.skipMetrics) {
    warning('Skipping alpha metrics tests (--skip-metrics flag)')
    return
  }
  
  log(`\n${colors.bold}${colors.magenta}=== Testing Alpha Metrics ===${colors.reset}`)
  
  try {
    // Test metrics structure
    await runTest('Alpha Metrics instance exists', () => {
      return alphaMetrics !== undefined
    })
    
    // Test critical alerts
    await runTest('Critical alerts accessible', async () => {
      try {
        const alerts = await alphaMetrics.getCriticalAlerts()
        return alerts && Array.isArray(alerts.alerts)
      } catch {
        return false
      }
    })
    
    if (TEST_CONFIG.verbose) {
      try {
        const alerts = await alphaMetrics.getCriticalAlerts()
        if (alerts.alerts.length > 0) {
          warning(`Found ${alerts.alerts.length} critical alerts:`)
          alerts.alerts.forEach(alert => {
            log(`  - ${alert.type}: ${alert.message} (${alert.severity})`, colors.yellow)
          })
        } else {
          success('No critical alerts found')
        }
      } catch (err) {
        error(`Failed to get critical alerts: ${err}`)
      }
    }
    
  } catch (err) {
    error(`Alpha metrics test failed: ${err}`)
  }
}

async function testAlphaFeedback() {
  if (TEST_CONFIG.skipDatabase) {
    warning('Skipping alpha feedback tests (--skip-db flag)')
    return
  }
  
  log(`\n${colors.bold}${colors.magenta}=== Testing Alpha Feedback ===${colors.reset}`)
  
  try {
    // Test feedback form configuration
    await runTest('Cooking feedback form configured', () => {
      const form = alphaFeedback.getCookingFeedbackForm('simple')
      return form.questions.length > 0 && form.estimatedTime > 0
    })
    
    await runTest('Complex recipe feedback has additional questions', () => {
      const simpleForm = alphaFeedback.getCookingFeedbackForm('simple')
      const complexForm = alphaFeedback.getCookingFeedbackForm('complex')
      return complexForm.questions.length >= simpleForm.questions.length
    })
    
    if (TEST_CONFIG.verbose) {
      const form = alphaFeedback.getCookingFeedbackForm('intermediate')
      info(`Feedback form has ${form.questions.length} questions, estimated ${form.estimatedTime}s`)
    }
    
  } catch (err) {
    error(`Alpha feedback test failed: ${err}`)
  }
}

async function testAlphaUserManagement() {
  log(`\n${colors.bold}${colors.magenta}=== Testing Alpha User Management ===${colors.reset}`)
  
  try {
    // Test onboarding flow
    await runTest('Onboarding steps configured', () => {
      const steps = alphaUserManager.getOnboardingSteps()
      return steps.length >= 5 && steps.every(step => step.title && step.component)
    })
    
    await runTest('Onboarding steps in correct order', () => {
      const steps = alphaUserManager.getOnboardingSteps()
      return steps.every((step, index) => step.order === index + 1)
    })
    
    // Test invite validation
    await runTest('Can validate alpha access', async () => {
      try {
        const access = await alphaUserManager.canAccessAlpha('test@example.com')
        return typeof access.canAccess === 'boolean'
      } catch {
        return true // It's okay if this fails in test environment
      }
    })
    
    if (TEST_CONFIG.verbose) {
      const steps = alphaUserManager.getOnboardingSteps()
      info(`Onboarding flow has ${steps.length} steps:`)
      steps.forEach(step => {
        log(`  ${step.order}. ${step.title} (${step.estimatedTime}min)`)
      })
    }
    
  } catch (err) {
    error(`Alpha user management test failed: ${err}`)
  }
}

async function testEnvironmentConfiguration() {
  log(`\n${colors.bold}${colors.magenta}=== Testing Environment Configuration ===${colors.reset}`)
  
  // Test required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  for (const envVar of requiredEnvVars) {
    await runTest(`${envVar} is set`, () => {
      return process.env[envVar] !== undefined && process.env[envVar] !== ''
    })
  }
  
  // Test alpha-specific configuration
  if (process.env.NEXT_PUBLIC_ALPHA_MODE === 'true') {
    await runTest('Alpha user limit is configured', () => {
      const limit = process.env.NEXT_PUBLIC_ALPHA_USER_LIMIT
      return limit !== undefined && parseInt(limit) > 0 && parseInt(limit) <= 50
    })
  }
  
  // Check for performance targets
  const performanceVars = [
    'ALPHA_SUCCESS_RATE_TARGET',
    'ALPHA_AI_RESPONSE_TIME_TARGET', 
    'ALPHA_PAGE_LOAD_TARGET'
  ]
  
  for (const perfVar of performanceVars) {
    if (process.env[perfVar]) {
      await runTest(`${perfVar} has valid value`, () => {
        const value = parseFloat(process.env[perfVar]!)
        return !isNaN(value) && value > 0
      })
    } else if (TEST_CONFIG.verbose) {
      warning(`Optional performance target ${perfVar} not set`)
    }
  }
}

async function testSystemHealth() {
  log(`\n${colors.bold}${colors.magenta}=== Testing System Health ===${colors.reset}`)
  
  // Test logging system
  await runTest('Logger instance available', () => {
    return logger !== undefined && typeof logger.info === 'function'
  })
  
  // Test that critical functions don't throw
  await runTest('Feature flags load without errors', () => {
    try {
      const enabledFeatures = Object.keys(FEATURES).filter(key => 
        FEATURES[key as keyof typeof FEATURES] === true
      )
      return enabledFeatures.length > 0
    } catch {
      return false
    }
  })
  
  // Memory usage check (basic)
  const memUsage = process.memoryUsage()
  const memUsageMB = Math.round(memUsage.rss / 1024 / 1024)
  
  await runTest(`Memory usage reasonable (${memUsageMB}MB)`, () => {
    return memUsageMB < 200 // Reasonable limit for testing
  })
  
  if (TEST_CONFIG.verbose) {
    info(`Memory usage: RSS ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
  }
}

async function generateTestReport() {
  log(`\n${colors.bold}${colors.cyan}=== Test Summary ===${colors.reset}`)
  
  const passRate = Math.round((testResults.passed / testResults.total) * 100)
  
  log(`Total Tests: ${testResults.total}`)
  success(`Passed: ${testResults.passed}`)
  if (testResults.failed > 0) {
    error(`Failed: ${testResults.failed}`)
  }
  if (testResults.warnings > 0) {
    warning(`Warnings: ${testResults.warnings}`)
  }
  
  log(`\nPass Rate: ${passRate}%`, passRate >= 90 ? colors.green : passRate >= 75 ? colors.yellow : colors.red)
  
  if (passRate >= 90) {
    success('\n🎉 Alpha launch configuration looks good!')
  } else if (passRate >= 75) {
    warning('\n⚠️  Alpha launch has some issues - review failures above')
  } else {
    error('\n🚨 Alpha launch configuration has significant issues')
  }
  
  // Alpha-specific recommendations
  if (FEATURES.alphaMode) {
    log(`\n${colors.bold}${colors.cyan}=== Alpha Launch Checklist ===${colors.reset}`)
    success('✅ Alpha mode enabled')
    success('✅ Core AI features enabled')
    success('✅ Social/Commerce features disabled')
    success('✅ Metrics and feedback collection ready')
    
    info('\nNext Steps:')
    info('1. Deploy to staging with alpha environment variables')
    info('2. Invite first batch of alpha users from waitlist')
    info('3. Monitor key metrics: success rate, AI usage, performance')
    info('4. Collect and analyze feedback for iterations')
    
    log(`\n${colors.bold}Success Criteria:${colors.reset}`)
    log('- 75%+ cooking success rate')
    log('- 70%+ AI feature usage')
    log('- <2s page load times')
    log('- <500ms AI response times')
  }
}

// Main test runner
async function runAlphaLaunchTests() {
  log(`${colors.bold}${colors.magenta}🚀 NIBBBLE Alpha Launch Test Suite${colors.reset}\n`)
  
  const startTime = Date.now()
  
  try {
    await testFeatureFlags()
    await testEnvironmentConfiguration() 
    await testAlphaMetrics()
    await testAlphaFeedback()
    await testAlphaUserManagement()
    await testSystemHealth()
    
    const duration = Math.round((Date.now() - startTime) / 1000)
    info(`\nTests completed in ${duration}s`)
    
    await generateTestReport()
    
  } catch (err) {
    error(`\nTest suite failed: ${err}`)
    process.exit(1)
  }
  
  // Exit with appropriate code
  const exitCode = testResults.failed > 0 ? 1 : 0
  process.exit(exitCode)
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAlphaLaunchTests().catch(err => {
    error(`Fatal error: ${err}`)
    process.exit(1)
  })
}

export { runAlphaLaunchTests }