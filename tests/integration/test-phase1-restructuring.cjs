/**
 * Phase 1 Foundation Restructuring Test Suite
 * Amazon.com/Shopee.sg Standards Validation
 * 
 * @fileoverview Test suite for validating Phase 1 directory restructuring progress
 * @author GetIt Platform Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class Phase1RestructuringTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
    this.clientSrcPath = path.join(__dirname, 'client', 'src');
    this.currentTimestamp = new Date().toISOString();
  }

  logTest(testName, success, result, error = null) {
    const status = success ? '✅ PASSED' : '❌ FAILED';
    const detail = {
      test: testName,
      status: status,
      result: result,
      timestamp: this.currentTimestamp,
      error: error
    };
    
    this.testResults.details.push(detail);
    
    if (success) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    console.log(`${status}: ${testName}`);
    if (result) {
      console.log(`   Result: ${JSON.stringify(result)}`);
    }
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }

  /**
   * Test 1: Verify New Directory Structure
   * Validates that new unified domain-driven architecture is in place
   */
  testNewDirectoryStructure() {
    try {
      const requiredDirectories = [
        'app',
        'app/routes',
        'app/providers',
        'shared',
        'shared/components',
        'shared/hooks',
        'shared/services',
        'shared/utils',
        'shared/constants',
        'domains',
        'domains/customer',
        'domains/customer/components',
        'domains/customer/pages',
        'domains/customer/services',
        'domains/customer/hooks',
        'domains/vendor',
        'domains/vendor/components',
        'domains/vendor/pages',
        'domains/vendor/services',
        'domains/vendor/hooks',
        'domains/admin',
        'domains/admin/components',
        'domains/admin/pages',
        'domains/admin/services',
        'domains/admin/hooks',
        'design-system',
        'design-system/atoms',
        'design-system/molecules',
        'design-system/organisms',
        'design-system/templates',
        'assets',
        'assets/images',
        'assets/icons',
        'assets/fonts'
      ];

      const missingDirectories = [];
      const existingDirectories = [];

      for (const dir of requiredDirectories) {
        const fullPath = path.join(this.clientSrcPath, dir);
        if (fs.existsSync(fullPath)) {
          existingDirectories.push(dir);
        } else {
          missingDirectories.push(dir);
        }
      }

      const score = (existingDirectories.length / requiredDirectories.length) * 100;

      this.logTest('New Directory Structure', score >= 90, {
        score: score,
        totalRequired: requiredDirectories.length,
        existing: existingDirectories.length,
        missing: missingDirectories.length,
        missingDirectories: missingDirectories.slice(0, 5)
      });

      return score >= 90;
    } catch (error) {
      this.logTest('New Directory Structure', false, null, error.message);
      return false;
    }
  }

  /**
   * Test 2: Verify Component Migration
   * Validates that components have been moved to appropriate domains
   */
  testComponentMigration() {
    try {
      const migrationStats = {
        customerComponents: 0,
        adminComponents: 0,
        vendorComponents: 0,
        sharedComponents: 0,
        totalMigrated: 0
      };

      // Count customer components
      const customerCompPath = path.join(this.clientSrcPath, 'domains', 'customer', 'components');
      if (fs.existsSync(customerCompPath)) {
        migrationStats.customerComponents = this.countFiles(customerCompPath, '.tsx');
      }

      // Count admin components
      const adminCompPath = path.join(this.clientSrcPath, 'domains', 'admin', 'components');
      if (fs.existsSync(adminCompPath)) {
        migrationStats.adminComponents = this.countFiles(adminCompPath, '.tsx');
      }

      // Count vendor components
      const vendorCompPath = path.join(this.clientSrcPath, 'domains', 'vendor', 'components');
      if (fs.existsSync(vendorCompPath)) {
        migrationStats.vendorComponents = this.countFiles(vendorCompPath, '.tsx');
      }

      // Count shared components
      const sharedCompPath = path.join(this.clientSrcPath, 'shared', 'components');
      if (fs.existsSync(sharedCompPath)) {
        migrationStats.sharedComponents = this.countFiles(sharedCompPath, '.tsx');
      }

      migrationStats.totalMigrated = migrationStats.customerComponents + 
                                   migrationStats.adminComponents + 
                                   migrationStats.vendorComponents + 
                                   migrationStats.sharedComponents;

      // Check if original components directory is empty or significantly reduced
      const originalCompPath = path.join(this.clientSrcPath, 'components');
      const remainingComponents = fs.existsSync(originalCompPath) ? 
        this.countFiles(originalCompPath, '.tsx') : 0;

      const migrationSuccess = migrationStats.totalMigrated > 100 && remainingComponents < 50;

      this.logTest('Component Migration', migrationSuccess, {
        migrationStats: migrationStats,
        remainingComponents: remainingComponents,
        migrationRate: Math.round((migrationStats.totalMigrated / (migrationStats.totalMigrated + remainingComponents)) * 100)
      });

      return migrationSuccess;
    } catch (error) {
      this.logTest('Component Migration', false, null, error.message);
      return false;
    }
  }

  /**
   * Test 3: Verify Pages Migration
   * Validates that pages have been moved to appropriate domains
   */
  testPagesMigration() {
    try {
      const pageStats = {
        customerPages: 0,
        adminPages: 0,
        vendorPages: 0,
        totalMigrated: 0
      };

      // Count customer pages
      const customerPagesPath = path.join(this.clientSrcPath, 'domains', 'customer', 'pages');
      if (fs.existsSync(customerPagesPath)) {
        pageStats.customerPages = this.countFiles(customerPagesPath, '.tsx');
      }

      // Count admin pages
      const adminPagesPath = path.join(this.clientSrcPath, 'domains', 'admin', 'pages');
      if (fs.existsSync(adminPagesPath)) {
        pageStats.adminPages = this.countFiles(adminPagesPath, '.tsx');
      }

      // Count vendor pages
      const vendorPagesPath = path.join(this.clientSrcPath, 'domains', 'vendor', 'pages');
      if (fs.existsSync(vendorPagesPath)) {
        pageStats.vendorPages = this.countFiles(vendorPagesPath, '.tsx');
      }

      pageStats.totalMigrated = pageStats.customerPages + pageStats.adminPages + pageStats.vendorPages;

      // Check if original pages directory is significantly reduced
      const originalPagesPath = path.join(this.clientSrcPath, 'pages');
      const remainingPages = fs.existsSync(originalPagesPath) ? 
        this.countFiles(originalPagesPath, '.tsx') : 0;

      const migrationSuccess = pageStats.totalMigrated > 50 && remainingPages < 20;

      this.logTest('Pages Migration', migrationSuccess, {
        pageStats: pageStats,
        remainingPages: remainingPages,
        migrationRate: Math.round((pageStats.totalMigrated / (pageStats.totalMigrated + remainingPages)) * 100)
      });

      return migrationSuccess;
    } catch (error) {
      this.logTest('Pages Migration', false, null, error.message);
      return false;
    }
  }

  /**
   * Test 4: Verify Services Migration
   * Validates that services have been moved to appropriate domains and shared
   */
  testServicesMigration() {
    try {
      const serviceStats = {
        customerServices: 0,
        adminServices: 0,
        vendorServices: 0,
        sharedServices: 0,
        totalMigrated: 0
      };

      // Count customer services
      const customerServicesPath = path.join(this.clientSrcPath, 'domains', 'customer', 'services');
      if (fs.existsSync(customerServicesPath)) {
        serviceStats.customerServices = this.countFiles(customerServicesPath, '.ts') + 
                                      this.countFiles(customerServicesPath, '.js');
      }

      // Count admin services
      const adminServicesPath = path.join(this.clientSrcPath, 'domains', 'admin', 'services');
      if (fs.existsSync(adminServicesPath)) {
        serviceStats.adminServices = this.countFiles(adminServicesPath, '.ts') + 
                                   this.countFiles(adminServicesPath, '.js');
      }

      // Count vendor services
      const vendorServicesPath = path.join(this.clientSrcPath, 'domains', 'vendor', 'services');
      if (fs.existsSync(vendorServicesPath)) {
        serviceStats.vendorServices = this.countFiles(vendorServicesPath, '.ts') + 
                                    this.countFiles(vendorServicesPath, '.js');
      }

      // Count shared services
      const sharedServicesPath = path.join(this.clientSrcPath, 'shared', 'services');
      if (fs.existsSync(sharedServicesPath)) {
        serviceStats.sharedServices = this.countFiles(sharedServicesPath, '.ts') + 
                                    this.countFiles(sharedServicesPath, '.js');
      }

      serviceStats.totalMigrated = serviceStats.customerServices + 
                                 serviceStats.adminServices + 
                                 serviceStats.vendorServices + 
                                 serviceStats.sharedServices;

      // Check if original services directory is significantly reduced
      const originalServicesPath = path.join(this.clientSrcPath, 'services');
      const remainingServices = fs.existsSync(originalServicesPath) ? 
        this.countFiles(originalServicesPath, '.ts') + this.countFiles(originalServicesPath, '.js') : 0;

      const migrationSuccess = serviceStats.totalMigrated > 50 && remainingServices < 20;

      this.logTest('Services Migration', migrationSuccess, {
        serviceStats: serviceStats,
        remainingServices: remainingServices,
        migrationRate: Math.round((serviceStats.totalMigrated / (serviceStats.totalMigrated + remainingServices)) * 100)
      });

      return migrationSuccess;
    } catch (error) {
      this.logTest('Services Migration', false, null, error.message);
      return false;
    }
  }

  /**
   * Test 5: Verify App Structure
   * Validates that App.tsx has been moved to app directory
   */
  testAppStructure() {
    try {
      const appPath = path.join(this.clientSrcPath, 'app', 'App.tsx');
      const mainAppPath = path.join(this.clientSrcPath, 'App.tsx');
      
      const appExists = fs.existsSync(appPath);
      const mainAppExists = fs.existsSync(mainAppPath);
      
      // Check if main App.tsx is a simple import from app/App.tsx
      let isProperImport = false;
      if (mainAppExists) {
        const mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
        isProperImport = mainAppContent.includes('import { App } from "./app/App"');
      }

      const structureCorrect = appExists && mainAppExists && isProperImport;

      this.logTest('App Structure', structureCorrect, {
        appInAppDir: appExists,
        mainAppExists: mainAppExists,
        properImport: isProperImport
      });

      return structureCorrect;
    } catch (error) {
      this.logTest('App Structure', false, null, error.message);
      return false;
    }
  }

  /**
   * Test 6: Verify Hooks Migration
   * Validates that hooks have been moved to appropriate domains and shared
   */
  testHooksMigration() {
    try {
      const hookStats = {
        customerHooks: 0,
        adminHooks: 0,
        vendorHooks: 0,
        sharedHooks: 0,
        totalMigrated: 0
      };

      // Count customer hooks
      const customerHooksPath = path.join(this.clientSrcPath, 'domains', 'customer', 'hooks');
      if (fs.existsSync(customerHooksPath)) {
        hookStats.customerHooks = this.countFiles(customerHooksPath, '.ts') + 
                                 this.countFiles(customerHooksPath, '.tsx');
      }

      // Count admin hooks
      const adminHooksPath = path.join(this.clientSrcPath, 'domains', 'admin', 'hooks');
      if (fs.existsSync(adminHooksPath)) {
        hookStats.adminHooks = this.countFiles(adminHooksPath, '.ts') + 
                             this.countFiles(adminHooksPath, '.tsx');
      }

      // Count vendor hooks
      const vendorHooksPath = path.join(this.clientSrcPath, 'domains', 'vendor', 'hooks');
      if (fs.existsSync(vendorHooksPath)) {
        hookStats.vendorHooks = this.countFiles(vendorHooksPath, '.ts') + 
                              this.countFiles(vendorHooksPath, '.tsx');
      }

      // Count shared hooks
      const sharedHooksPath = path.join(this.clientSrcPath, 'shared', 'hooks');
      if (fs.existsSync(sharedHooksPath)) {
        hookStats.sharedHooks = this.countFiles(sharedHooksPath, '.ts') + 
                              this.countFiles(sharedHooksPath, '.tsx');
      }

      hookStats.totalMigrated = hookStats.customerHooks + 
                              hookStats.adminHooks + 
                              hookStats.vendorHooks + 
                              hookStats.sharedHooks;

      // Check if original hooks directory is significantly reduced
      const originalHooksPath = path.join(this.clientSrcPath, 'hooks');
      const remainingHooks = fs.existsSync(originalHooksPath) ? 
        this.countFiles(originalHooksPath, '.ts') + this.countFiles(originalHooksPath, '.tsx') : 0;

      const migrationSuccess = hookStats.totalMigrated > 20 && remainingHooks < 10;

      this.logTest('Hooks Migration', migrationSuccess, {
        hookStats: hookStats,
        remainingHooks: remainingHooks,
        migrationRate: Math.round((hookStats.totalMigrated / (hookStats.totalMigrated + remainingHooks)) * 100)
      });

      return migrationSuccess;
    } catch (error) {
      this.logTest('Hooks Migration', false, null, error.message);
      return false;
    }
  }

  /**
   * Helper function to count files with specific extension
   */
  countFiles(dirPath, extension) {
    try {
      if (!fs.existsSync(dirPath)) {
        return 0;
      }
      
      let count = 0;
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          count += this.countFiles(path.join(dirPath, item.name), extension);
        } else if (item.name.endsWith(extension)) {
          count++;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate Overall Restructuring Score
   */
  calculateRestructuringScore() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? (this.testResults.passed / totalTests) * 100 : 0;
    
    return {
      totalTests: totalTests,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      successRate: successRate,
      grade: this.getGrade(successRate),
      status: this.getRestructuringStatus(successRate)
    };
  }

  getGrade(score) {
    if (score >= 90) return 'A (Excellent)';
    if (score >= 80) return 'B (Good)';
    if (score >= 70) return 'C (Satisfactory)';
    if (score >= 60) return 'D (Needs Improvement)';
    return 'F (Critical)';
  }

  getRestructuringStatus(score) {
    if (score >= 80) return 'Phase 1 Foundation Complete';
    if (score >= 60) return 'Phase 1 Partially Complete';
    if (score >= 40) return 'Phase 1 In Progress';
    return 'Phase 1 Requires Attention';
  }

  /**
   * Run comprehensive Phase 1 restructuring test suite
   */
  async runFullTestSuite() {
    console.log('🚀 Starting Phase 1 Foundation Restructuring Test Suite...');
    console.log('📋 Testing Domain-Driven Architecture Implementation\n');
    
    console.log('⏳ Validating directory structure and component migration...');
    
    // Run all tests
    this.testNewDirectoryStructure();
    this.testComponentMigration();
    this.testPagesMigration();
    this.testServicesMigration();
    this.testAppStructure();
    this.testHooksMigration();
    
    return this.calculateRestructuringScore();
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const overallScore = this.calculateRestructuringScore();
    const duration = ((Date.now() - new Date(this.currentTimestamp).getTime()) / 1000).toFixed(3);
    
    console.log('\n📊 PHASE 1 FOUNDATION RESTRUCTURING RESULTS');
    console.log('==========================================');
    console.log(`✅ Passed: ${overallScore.passed}`);
    console.log(`❌ Failed: ${overallScore.failed}`);
    console.log(`🕒 Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${overallScore.successRate.toFixed(1)}%`);
    console.log(`🎯 Grade: ${overallScore.grade}`);
    console.log(`🔄 Status: ${overallScore.status}`);
    
    console.log('\n📋 Individual Test Results:');
    this.testResults.details.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.test}: ${detail.status}`);
      if (detail.result && detail.result.score) {
        console.log(`   Score: ${detail.result.score.toFixed(1)}%`);
      }
    });
    
    console.log('\n🎯 PHASE 1 RECOMMENDATIONS:');
    if (overallScore.successRate < 60) {
      console.log('🚨 CRITICAL: Continue Phase 1 restructuring implementation');
      console.log('   - Complete component migration to domain directories');
      console.log('   - Finalize service layer consolidation');
      console.log('   - Update all import paths to new structure');
    } else if (overallScore.successRate < 80) {
      console.log('⚠️  GOOD PROGRESS: Phase 1 partially complete');
      console.log('   - Fix remaining import path issues');
      console.log('   - Complete hooks and utilities migration');
      console.log('   - Prepare for Phase 2 implementation');
    } else {
      console.log('🎉 EXCELLENT: Phase 1 foundation restructuring complete');
      console.log('   - Begin Phase 2: Performance & Mobile Optimization');
      console.log('   - Focus on code splitting and bundle optimization');
      console.log('   - Implement atomic design system');
    }
    
    return overallScore;
  }
}

/**
 * Execute Phase 1 restructuring test suite
 */
async function runPhase1RestructuringTests() {
  const tester = new Phase1RestructuringTester();
  
  try {
    const results = await tester.runFullTestSuite();
    const report = tester.generateReport();
    
    return {
      success: true,
      results: results,
      report: report
    };
  } catch (error) {
    console.error('❌ Phase 1 restructuring test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  runPhase1RestructuringTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { Phase1RestructuringTester, runPhase1RestructuringTests };