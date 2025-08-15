/**
 * Comprehensive Frontend Codebase Audit Validation Test
 * Validates the detailed codebase structure analysis against Amazon.com/Shopee.sg standards
 * 
 * @fileoverview Complete validation of frontend audit findings
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

class ComprehensiveFrontendAuditValidator {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.auditFindings = {};
    this.startTime = new Date();
  }

  logTest(testName, success, result, error = null) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const message = success ? result : `Error: ${error || result}`;
    
    console.log(`${status} - ${testName}`);
    if (!success) {
      console.log(`   ${message}`);
    }
    
    this.testResults.push({
      test: testName,
      status: success ? 'PASS' : 'FAIL',
      result: message,
      timestamp: new Date().toISOString()
    });
    
    this.totalTests++;
    if (success) this.passedTests++;
    else this.failedTests++;
  }

  /**
   * Test 1: Directory Structure Analysis
   */
  testDirectoryStructure() {
    try {
      const clientPath = path.join(process.cwd(), 'client');
      const srcPath = path.join(clientPath, 'src');
      
      if (!fs.existsSync(clientPath)) {
        this.logTest('Directory Structure Analysis', false, 'Client directory not found');
        return;
      }

      const requiredDirs = [
        'src/app',
        'src/domains',
        'src/shared',
        'src/design-system',
        'src/services',
        'src/components'
      ];

      const existingDirs = [];
      const missingDirs = [];

      requiredDirs.forEach(dir => {
        const fullPath = path.join(clientPath, dir);
        if (fs.existsSync(fullPath)) {
          existingDirs.push(dir);
        } else {
          missingDirs.push(dir);
        }
      });

      this.auditFindings.directoryStructure = {
        existing: existingDirs,
        missing: missingDirs,
        compliance: (existingDirs.length / requiredDirs.length) * 100
      };

      const success = existingDirs.length >= 5; // At least 5 of 6 directories
      this.logTest('Directory Structure Analysis', success, 
        `Found ${existingDirs.length}/${requiredDirs.length} required directories`);
    } catch (error) {
      this.logTest('Directory Structure Analysis', false, 'Failed to analyze directory structure', error.message);
    }
  }

  /**
   * Test 2: Domain-Driven Architecture Analysis
   */
  testDomainDrivenArchitecture() {
    try {
      const domainsPath = path.join(process.cwd(), 'client/src/domains');
      
      if (!fs.existsSync(domainsPath)) {
        this.logTest('Domain-Driven Architecture Analysis', false, 'Domains directory not found');
        return;
      }

      const domains = fs.readdirSync(domainsPath).filter(item => {
        return fs.statSync(path.join(domainsPath, item)).isDirectory();
      });

      const expectedDomains = ['customer', 'admin', 'vendor'];
      const foundDomains = domains.filter(domain => expectedDomains.includes(domain));

      this.auditFindings.domainArchitecture = {
        domains: foundDomains,
        totalDomains: domains.length,
        compliance: (foundDomains.length / expectedDomains.length) * 100
      };

      const success = foundDomains.length >= 3;
      this.logTest('Domain-Driven Architecture Analysis', success,
        `Found ${foundDomains.length}/${expectedDomains.length} expected domains: ${foundDomains.join(', ')}`);
    } catch (error) {
      this.logTest('Domain-Driven Architecture Analysis', false, 'Failed to analyze domain architecture', error.message);
    }
  }

  /**
   * Test 3: Atomic Design System Analysis
   */
  testAtomicDesignSystem() {
    try {
      const designSystemPath = path.join(process.cwd(), 'client/src/design-system');
      
      if (!fs.existsSync(designSystemPath)) {
        this.logTest('Atomic Design System Analysis', false, 'Design system directory not found');
        return;
      }

      const atomicLayers = ['atoms', 'molecules', 'organisms', 'templates'];
      const foundLayers = [];

      atomicLayers.forEach(layer => {
        const layerPath = path.join(designSystemPath, layer);
        if (fs.existsSync(layerPath)) {
          foundLayers.push(layer);
        }
      });

      // Count components in each layer
      const componentCounts = {};
      foundLayers.forEach(layer => {
        const layerPath = path.join(designSystemPath, layer);
        const components = fs.readdirSync(layerPath).filter(item => {
          return fs.statSync(path.join(layerPath, item)).isDirectory();
        });
        componentCounts[layer] = components.length;
      });

      this.auditFindings.atomicDesignSystem = {
        layers: foundLayers,
        componentCounts,
        compliance: (foundLayers.length / atomicLayers.length) * 100
      };

      const success = foundLayers.length >= 3;
      this.logTest('Atomic Design System Analysis', success,
        `Found ${foundLayers.length}/${atomicLayers.length} atomic layers with ${JSON.stringify(componentCounts)} components`);
    } catch (error) {
      this.logTest('Atomic Design System Analysis', false, 'Failed to analyze atomic design system', error.message);
    }
  }

  /**
   * Test 4: Services Architecture Analysis
   */
  testServicesArchitecture() {
    try {
      const servicesPath = path.join(process.cwd(), 'client/src/services');
      
      if (!fs.existsSync(servicesPath)) {
        this.logTest('Services Architecture Analysis', false, 'Services directory not found');
        return;
      }

      const serviceCategories = ['core', 'advanced', 'enterprise', 'performance', 'mobile'];
      const foundCategories = [];

      serviceCategories.forEach(category => {
        const categoryPath = path.join(servicesPath, category);
        if (fs.existsSync(categoryPath)) {
          foundCategories.push(category);
        }
      });

      // Count services in each category
      const serviceCounts = {};
      foundCategories.forEach(category => {
        const categoryPath = path.join(servicesPath, category);
        const services = fs.readdirSync(categoryPath).filter(item => {
          return item.endsWith('.ts') && !item.includes('index');
        });
        serviceCounts[category] = services.length;
      });

      this.auditFindings.servicesArchitecture = {
        categories: foundCategories,
        serviceCounts,
        compliance: (foundCategories.length / serviceCategories.length) * 100
      };

      const success = foundCategories.length >= 4;
      this.logTest('Services Architecture Analysis', success,
        `Found ${foundCategories.length}/${serviceCategories.length} service categories with ${JSON.stringify(serviceCounts)} services`);
    } catch (error) {
      this.logTest('Services Architecture Analysis', false, 'Failed to analyze services architecture', error.message);
    }
  }

  /**
   * Test 5: Component Library Analysis
   */
  testComponentLibrary() {
    try {
      const sharedComponentsPath = path.join(process.cwd(), 'client/src/shared/components');
      
      if (!fs.existsSync(sharedComponentsPath)) {
        this.logTest('Component Library Analysis', false, 'Shared components directory not found');
        return;
      }

      // Count components recursively
      const countComponents = (dir) => {
        let count = 0;
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            count += countComponents(itemPath);
          } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            count++;
          }
        });
        
        return count;
      };

      const componentCount = countComponents(sharedComponentsPath);
      
      this.auditFindings.componentLibrary = {
        totalComponents: componentCount,
        targetComponents: 200,
        compliance: (componentCount / 200) * 100
      };

      const success = componentCount >= 50;
      this.logTest('Component Library Analysis', success,
        `Found ${componentCount} components (Target: 200 for Amazon.com/Shopee.sg standards)`);
    } catch (error) {
      this.logTest('Component Library Analysis', false, 'Failed to analyze component library', error.message);
    }
  }

  /**
   * Test 6: Micro-Frontend Architecture Assessment
   */
  testMicroFrontendArchitecture() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        this.logTest('Micro-Frontend Architecture Assessment', false, 'Package.json not found');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const microFrontendDeps = [
        '@module-federation/webpack',
        'webpack-federation-runtime',
        'module-federation-plugin'
      ];

      const foundDeps = microFrontendDeps.filter(dep => dependencies[dep]);

      this.auditFindings.microFrontendArchitecture = {
        dependencies: foundDeps,
        hasMicroFrontend: foundDeps.length > 0,
        compliance: foundDeps.length > 0 ? 100 : 0
      };

      const success = foundDeps.length > 0;
      this.logTest('Micro-Frontend Architecture Assessment', success,
        success ? `Found micro-frontend dependencies: ${foundDeps.join(', ')}` : 'No micro-frontend architecture detected');
    } catch (error) {
      this.logTest('Micro-Frontend Architecture Assessment', false, 'Failed to assess micro-frontend architecture', error.message);
    }
  }

  /**
   * Test 7: State Management Analysis
   */
  testStateManagement() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        this.logTest('State Management Analysis', false, 'Package.json not found');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const stateManagementLibs = {
        redux: '@reduxjs/toolkit',
        reactQuery: '@tanstack/react-query',
        zustand: 'zustand',
        context: 'react' // Context API is built-in
      };

      const foundLibs = {};
      Object.keys(stateManagementLibs).forEach(lib => {
        const depName = stateManagementLibs[lib];
        if (dependencies[depName]) {
          foundLibs[lib] = depName;
        }
      });

      // Check for Context API usage
      const contextUsage = this.checkContextUsage();

      this.auditFindings.stateManagement = {
        libraries: foundLibs,
        contextUsage,
        hasAdvancedStateManagement: !!(foundLibs.redux || foundLibs.zustand),
        compliance: (foundLibs.redux || foundLibs.zustand) ? 100 : 30
      };

      const success = !!(foundLibs.redux || foundLibs.zustand);
      this.logTest('State Management Analysis', success,
        success ? `Found advanced state management: ${Object.keys(foundLibs).join(', ')}` : 'Only basic Context API detected');
    } catch (error) {
      this.logTest('State Management Analysis', false, 'Failed to analyze state management', error.message);
    }
  }

  /**
   * Test 8: Testing Infrastructure Analysis
   */
  testTestingInfrastructure() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        this.logTest('Testing Infrastructure Analysis', false, 'Package.json not found');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const testingLibs = {
        jest: 'jest',
        testingLibrary: '@testing-library/react',
        playwright: 'playwright',
        vitest: 'vitest',
        cypress: 'cypress'
      };

      const foundLibs = {};
      Object.keys(testingLibs).forEach(lib => {
        const depName = testingLibs[lib];
        if (dependencies[depName]) {
          foundLibs[lib] = depName;
        }
      });

      // Check for test files
      const testFiles = this.countTestFiles();

      this.auditFindings.testingInfrastructure = {
        libraries: foundLibs,
        testFiles,
        hasComprehensiveTesting: Object.keys(foundLibs).length >= 2,
        compliance: (Object.keys(foundLibs).length / 3) * 100
      };

      const success = Object.keys(foundLibs).length >= 2;
      this.logTest('Testing Infrastructure Analysis', success,
        success ? `Found testing libraries: ${Object.keys(foundLibs).join(', ')} with ${testFiles} test files` : 'Limited testing infrastructure detected');
    } catch (error) {
      this.logTest('Testing Infrastructure Analysis', false, 'Failed to analyze testing infrastructure', error.message);
    }
  }

  /**
   * Test 9: Performance Optimization Analysis
   */
  testPerformanceOptimization() {
    try {
      const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
      const webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');
      
      let hasOptimizationConfig = false;
      let optimizationFeatures = [];

      if (fs.existsSync(viteConfigPath)) {
        const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
        if (viteConfig.includes('build') || viteConfig.includes('rollupOptions')) {
          hasOptimizationConfig = true;
          optimizationFeatures.push('Vite build optimization');
        }
      }

      if (fs.existsSync(webpackConfigPath)) {
        const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
        if (webpackConfig.includes('optimization')) {
          hasOptimizationConfig = true;
          optimizationFeatures.push('Webpack optimization');
        }
      }

      // Check for performance services
      const performanceServicesPath = path.join(process.cwd(), 'client/src/services/performance');
      if (fs.existsSync(performanceServicesPath)) {
        const performanceServices = fs.readdirSync(performanceServicesPath).filter(item => {
          return item.endsWith('.ts') && !item.includes('index');
        });
        optimizationFeatures.push(`${performanceServices.length} performance services`);
      }

      this.auditFindings.performanceOptimization = {
        hasOptimizationConfig,
        optimizationFeatures,
        compliance: hasOptimizationConfig ? 60 : 20
      };

      const success = hasOptimizationConfig && optimizationFeatures.length >= 2;
      this.logTest('Performance Optimization Analysis', success,
        success ? `Found optimization features: ${optimizationFeatures.join(', ')}` : 'Limited performance optimization detected');
    } catch (error) {
      this.logTest('Performance Optimization Analysis', false, 'Failed to analyze performance optimization', error.message);
    }
  }

  /**
   * Test 10: PWA Implementation Analysis
   */
  testPWAImplementation() {
    try {
      const publicPath = path.join(process.cwd(), 'client/public');
      
      const pwaFiles = [
        'manifest.json',
        'sw.js',
        'offline.html'
      ];

      const foundFiles = pwaFiles.filter(file => {
        return fs.existsSync(path.join(publicPath, file));
      });

      // Check for PWA services
      const pwaServicesPath = path.join(process.cwd(), 'client/src/pwa');
      let pwaServices = [];
      if (fs.existsSync(pwaServicesPath)) {
        pwaServices = fs.readdirSync(pwaServicesPath).filter(item => {
          return item.endsWith('.tsx') || item.endsWith('.ts');
        });
      }

      this.auditFindings.pwaImplementation = {
        foundFiles,
        pwaServices,
        hasBasicPWA: foundFiles.length >= 2,
        compliance: (foundFiles.length / pwaFiles.length) * 100
      };

      const success = foundFiles.length >= 2;
      this.logTest('PWA Implementation Analysis', success,
        success ? `Found PWA files: ${foundFiles.join(', ')} and ${pwaServices.length} PWA services` : 'Limited PWA implementation detected');
    } catch (error) {
      this.logTest('PWA Implementation Analysis', false, 'Failed to analyze PWA implementation', error.message);
    }
  }

  /**
   * Helper method to check Context API usage
   */
  checkContextUsage() {
    try {
      const contextsPath = path.join(process.cwd(), 'client/src/contexts');
      if (!fs.existsSync(contextsPath)) {
        return 0;
      }

      const contextFiles = fs.readdirSync(contextsPath).filter(item => {
        return item.endsWith('.tsx') || item.endsWith('.ts');
      });

      return contextFiles.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Helper method to count test files
   */
  countTestFiles() {
    try {
      const testDirs = [
        'client/src/__tests__',
        'client/src/design-system/__tests__',
        'tests',
        '__tests__'
      ];

      let totalTestFiles = 0;

      testDirs.forEach(testDir => {
        const fullPath = path.join(process.cwd(), testDir);
        if (fs.existsSync(fullPath)) {
          const countTestsInDir = (dir) => {
            let count = 0;
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
              const itemPath = path.join(dir, item);
              const stat = fs.statSync(itemPath);
              
              if (stat.isDirectory()) {
                count += countTestsInDir(itemPath);
              } else if (item.includes('.test.') || item.includes('.spec.')) {
                count++;
              }
            });
            
            return count;
          };

          totalTestFiles += countTestsInDir(fullPath);
        }
      });

      return totalTestFiles;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Run all audit tests
   */
  async runComprehensiveAudit() {
    console.log('🚀 COMPREHENSIVE GETIT FRONTEND CODEBASE AUDIT');
    console.log('================================================================================');
    console.log('Amazon.com/Shopee.sg Standards Compliance Assessment');
    console.log('Validating detailed codebase structure analysis...\n');

    // Run all tests
    this.testDirectoryStructure();
    this.testDomainDrivenArchitecture();
    this.testAtomicDesignSystem();
    this.testServicesArchitecture();
    this.testComponentLibrary();
    this.testMicroFrontendArchitecture();
    this.testStateManagement();
    this.testTestingInfrastructure();
    this.testPerformanceOptimization();
    this.testPWAImplementation();

    // Calculate overall compliance
    const overallCompliance = this.calculateOverallCompliance();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE FRONTEND CODEBASE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🎯 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Overall Compliance: ${overallCompliance.toFixed(1)}%`);
    console.log(`🏆 Amazon.com/Shopee.sg Standards: ${overallCompliance >= 70 ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
    console.log(`🔴 STATUS: ${overallCompliance >= 70 ? 'PRODUCTION READY' : 'NEEDS IMPROVEMENT'}`);

    // Detailed findings
    console.log('\n🎯 DETAILED AUDIT FINDINGS:');
    console.log('   📂 Directory Structure:', this.auditFindings.directoryStructure?.compliance.toFixed(1) + '%');
    console.log('   🏗️ Domain Architecture:', this.auditFindings.domainArchitecture?.compliance.toFixed(1) + '%');
    console.log('   ⚛️ Atomic Design System:', this.auditFindings.atomicDesignSystem?.compliance.toFixed(1) + '%');
    console.log('   🔧 Services Architecture:', this.auditFindings.servicesArchitecture?.compliance.toFixed(1) + '%');
    console.log('   📚 Component Library:', this.auditFindings.componentLibrary?.compliance.toFixed(1) + '%');
    console.log('   🏭 Micro-Frontend:', this.auditFindings.microFrontendArchitecture?.compliance.toFixed(1) + '%');
    console.log('   🗂️ State Management:', this.auditFindings.stateManagement?.compliance.toFixed(1) + '%');
    console.log('   🧪 Testing Infrastructure:', this.auditFindings.testingInfrastructure?.compliance.toFixed(1) + '%');
    console.log('   ⚡ Performance Optimization:', this.auditFindings.performanceOptimization?.compliance.toFixed(1) + '%');
    console.log('   📱 PWA Implementation:', this.auditFindings.pwaImplementation?.compliance.toFixed(1) + '%');

    // Recommendations
    console.log('\n🎯 IMMEDIATE RECOMMENDATIONS:');
    if (this.auditFindings.microFrontendArchitecture?.compliance < 50) {
      console.log('   → Priority: Implement micro-frontend architecture');
    }
    if (this.auditFindings.stateManagement?.compliance < 50) {
      console.log('   → Priority: Upgrade to Redux Toolkit + RTK Query');
    }
    if (this.auditFindings.testingInfrastructure?.compliance < 50) {
      console.log('   → Priority: Setup comprehensive testing infrastructure');
    }
    if (this.auditFindings.performanceOptimization?.compliance < 50) {
      console.log('   → Priority: Implement advanced performance optimization');
    }
    if (this.auditFindings.componentLibrary?.compliance < 50) {
      console.log('   → Priority: Expand component library to 200+ components');
    }

    // Test results summary
    console.log('\n📋 DETAILED TEST RESULTS:');
    if (this.failedTests > 0) {
      console.log('   ❌ FAILED TESTS:');
      this.testResults.filter(result => result.status === 'FAIL').forEach(result => {
        console.log(`      → ${result.test}`);
      });
    }
    
    if (this.passedTests > 0) {
      console.log('   ✅ PASSED TESTS:');
      this.testResults.filter(result => result.status === 'PASS').forEach(result => {
        console.log(`      → ${result.test}`);
      });
    }

    console.log('\n📖 REFERENCE DOCUMENTS:');
    console.log('   → COMPREHENSIVE_GETIT_FRONTEND_CODEBASE_AUDIT_AMAZON_SHOPEE_STANDARDS_JANUARY_2025.md');
    console.log('   → Implementation roadmap: 24 weeks, $210,000 investment');
    console.log('   → Expected outcome: 95% Amazon.com/Shopee.sg compliance');

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Calculate overall compliance score
   */
  calculateOverallCompliance() {
    const weights = {
      directoryStructure: 0.1,
      domainArchitecture: 0.15,
      atomicDesignSystem: 0.1,
      servicesArchitecture: 0.1,
      componentLibrary: 0.15,
      microFrontendArchitecture: 0.2,
      stateManagement: 0.15,
      testingInfrastructure: 0.2,
      performanceOptimization: 0.15,
      pwaImplementation: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(key => {
      if (this.auditFindings[key] && this.auditFindings[key].compliance !== undefined) {
        totalScore += this.auditFindings[key].compliance * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        overallCompliance: this.calculateOverallCompliance()
      },
      findings: this.auditFindings,
      testResults: this.testResults,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Generate recommendations based on audit findings
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.auditFindings.microFrontendArchitecture?.compliance < 50) {
      recommendations.push({
        priority: 'Critical',
        area: 'Micro-Frontend Architecture',
        action: 'Implement Module Federation for independent deployments',
        timeframe: '2 weeks',
        investment: '$20,000'
      });
    }

    if (this.auditFindings.stateManagement?.compliance < 50) {
      recommendations.push({
        priority: 'Critical',
        area: 'State Management',
        action: 'Upgrade to Redux Toolkit + RTK Query',
        timeframe: '2 weeks',
        investment: '$20,000'
      });
    }

    if (this.auditFindings.testingInfrastructure?.compliance < 50) {
      recommendations.push({
        priority: 'Critical',
        area: 'Testing Infrastructure',
        action: 'Setup Jest + Testing Library + Playwright',
        timeframe: '2 weeks',
        investment: '$20,000'
      });
    }

    if (this.auditFindings.performanceOptimization?.compliance < 50) {
      recommendations.push({
        priority: 'High',
        area: 'Performance Optimization',
        action: 'Implement advanced bundle management and optimization',
        timeframe: '2 weeks',
        investment: '$18,000'
      });
    }

    if (this.auditFindings.componentLibrary?.compliance < 50) {
      recommendations.push({
        priority: 'High',
        area: 'Component Library',
        action: 'Expand to 200+ components with design tokens',
        timeframe: '2 weeks',
        investment: '$17,000'
      });
    }

    return recommendations;
  }
}

/**
 * Main execution function
 */
async function runComprehensiveFrontendAudit() {
  const validator = new ComprehensiveFrontendAuditValidator();
  await validator.runComprehensiveAudit();
  
  // Generate detailed report
  const report = validator.generateDetailedReport();
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'comprehensive-frontend-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return report;
}

// Run the audit if this file is executed directly
if (process.argv[1] === import.meta.url.split('://')[1]) {
  runComprehensiveFrontendAudit()
    .then(() => {
      console.log('\n🎉 Comprehensive frontend audit completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Comprehensive frontend audit failed:', error);
      process.exit(1);
    });
}

export { ComprehensiveFrontendAuditValidator, runComprehensiveFrontendAudit };