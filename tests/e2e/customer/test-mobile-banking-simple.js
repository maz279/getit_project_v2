#!/usr/bin/env node

/**
 * Simple Mobile Banking Services Test
 * Phase 2 Week 5-6 Mobile Banking Integration
 * Direct service testing without server dependency
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

class SimpleMobileBankingTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  logTest(testName, success, result, error = null) {
    const duration = Date.now() - this.startTime;
    const status = success ? '✅ PASS' : '❌ FAIL';
    
    this.results.push({
      test: testName,
      success,
      result,
      error,
      duration: `${duration}ms`
    });
    
    console.log(`${status} ${testName} (${duration}ms)`);
    if (result) console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
    if (error) console.log(`   Error: ${error}`);
    console.log();
  }

  /**
   * Test TypeScript compilation
   */
  testTypeScriptCompilation() {
    try {
      // Test BKash service compilation
      execSync('npx tsc --noEmit server/services/payment/BKashPaymentService.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      // Test Nagad service compilation
      execSync('npx tsc --noEmit server/services/payment/NagadPaymentService.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      // Test Rocket service compilation
      execSync('npx tsc --noEmit server/services/payment/RocketPaymentService.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      // Test Orchestrator compilation
      execSync('npx tsc --noEmit server/services/payment/MobileBankingOrchestrator.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      this.logTest('TypeScript Compilation', true, {
        message: 'All mobile banking services compile successfully',
        services: ['BKash', 'Nagad', 'Rocket', 'Orchestrator']
      });
      
      return true;
    } catch (error) {
      this.logTest('TypeScript Compilation', false, null, error.message);
      return false;
    }
  }

  /**
   * Test mobile banking routes compilation
   */
  testMobileBankingRoutes() {
    try {
      execSync('npx tsc --noEmit server/routes/mobileBanking.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      this.logTest('Mobile Banking Routes Compilation', true, {
        message: 'Mobile banking routes compile successfully',
        file: 'server/routes/mobileBanking.ts'
      });
      
      return true;
    } catch (error) {
      this.logTest('Mobile Banking Routes Compilation', false, null, error.message);
      return false;
    }
  }

  /**
   * Test service file structure
   */
  testServiceFileStructure() {
    const files = [
      'server/services/payment/BKashPaymentService.ts',
      'server/services/payment/NagadPaymentService.ts',
      'server/services/payment/RocketPaymentService.ts',
      'server/services/payment/MobileBankingOrchestrator.ts',
      'server/routes/mobileBanking.ts'
    ];
    
    let allExist = true;
    const results = {};
    
    for (const file of files) {
      const exists = fs.existsSync(file);
      results[file] = exists;
      if (!exists) allExist = false;
    }
    
    this.logTest('Service File Structure', allExist, {
      message: 'All mobile banking service files exist',
      files: results
    });
    
    return allExist;
  }

  /**
   * Test basic service imports
   */
  testBasicServiceImports() {
    try {
      // Test basic TypeScript compilation with imports
      const testCode = `
        import BKashPaymentService from './server/services/payment/BKashPaymentService';
        import NagadPaymentService from './server/services/payment/NagadPaymentService';
        import RocketPaymentService from './server/services/payment/RocketPaymentService';
        import MobileBankingOrchestrator from './server/services/payment/MobileBankingOrchestrator';
        
        const bkashService = new BKashPaymentService();
        const nagadService = new NagadPaymentService();
        const rocketService = new RocketPaymentService();
        const orchestrator = new MobileBankingOrchestrator();
        
        console.log('Services instantiated successfully');
      `;
      
      fs.writeFileSync('temp-test.ts', testCode);
      
      execSync('npx tsc --noEmit temp-test.ts', { 
        cwd: process.cwd(), 
        stdio: 'pipe' 
      });
      
      fs.unlinkSync('temp-test.ts');
      
      this.logTest('Basic Service Imports', true, {
        message: 'All services can be imported and instantiated',
        services: ['BKash', 'Nagad', 'Rocket', 'Orchestrator']
      });
      
      return true;
    } catch (error) {
      this.logTest('Basic Service Imports', false, null, error.message);
      return false;
    }
  }

  /**
   * Test API route structure
   */
  testAPIRouteStructure() {
    try {
      const routeContent = fs.readFileSync('server/routes/mobileBanking.ts', 'utf8');
      
      const endpoints = [
        'process-payment',
        'health',
        'balance',
        'transactions',
        'bkash/process-payment',
        'nagad/process-payment',
        'rocket/process-payment',
        'admin/analytics'
      ];
      
      let allEndpointsFound = true;
      const foundEndpoints = {};
      
      for (const endpoint of endpoints) {
        const found = routeContent.includes(endpoint);
        foundEndpoints[endpoint] = found;
        if (!found) allEndpointsFound = false;
      }
      
      this.logTest('API Route Structure', allEndpointsFound, {
        message: 'All expected API endpoints found in routes',
        endpoints: foundEndpoints
      });
      
      return allEndpointsFound;
    } catch (error) {
      this.logTest('API Route Structure', false, null, error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Simple Mobile Banking Services Test');
    console.log('Phase 2 Week 5-6 Mobile Banking Integration');
    console.log('Investment: $55,000 Enhanced Implementation');
    console.log('=' .repeat(70));
    console.log();

    const tests = [
      () => this.testServiceFileStructure(),
      () => this.testTypeScriptCompilation(),
      () => this.testMobileBankingRoutes(),
      () => this.testBasicServiceImports(),
      () => this.testAPIRouteStructure()
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`Test failed with error: ${error.message}`);
      }
    }

    this.generateReport(passed, failed);
    return { passed, failed, total: tests.length };
  }

  /**
   * Generate test report
   */
  generateReport(passed, failed) {
    const total = passed + failed;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log();
    console.log('=' .repeat(70));
    console.log('📊 SIMPLE MOBILE BANKING SERVICES TEST REPORT');
    console.log('=' .repeat(70));
    console.log();
    console.log(`✅ Tests Passed: ${passed}/${total} (${successRate}%)`);
    console.log(`❌ Tests Failed: ${failed}/${total}`);
    console.log();
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT: Mobile banking services are ready for testing!');
    } else if (successRate >= 60) {
      console.log('⚠️  GOOD: Most services working, minor issues to resolve');
    } else {
      console.log('🔧 NEEDS WORK: Significant issues need to be addressed');
    }
    
    console.log();
    console.log('Next Steps:');
    console.log('1. Fix any compilation errors');
    console.log('2. Start server and test API endpoints');
    console.log('3. Run full Phase 2 Week 5-6 test suite');
    console.log('4. Validate $55,000 investment compliance');
    console.log();
  }
}

// Run tests
const tester = new SimpleMobileBankingTest();
tester.runAllTests()
  .then(result => {
    console.log('Test execution completed');
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });