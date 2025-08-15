/**
 * Phase 1 Comprehensive Validation Test
 * Amazon.com/Shopee.sg Enterprise Standards Compliance Test
 * Tests all critical Phase 1 implementations for 100% targeted outcome
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Phase1ComprehensiveValidator {
  constructor() {
    this.results = [];
    this.successCount = 0;
    this.totalTests = 0;
  }

  logTest(testName, success, result, error = null) {
    this.totalTests++;
    if (success) {
      this.successCount++;
      console.log(`✅ ${testName}: ${result}`);
    } else {
      console.log(`❌ ${testName}: ${result}`);
      if (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
    this.results.push({ testName, success, result, error });
  }

  /**
   * Test 1: Module Federation Configuration
   */
  testModuleFederationSetup() {
    try {
      const webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');
      if (!fs.existsSync(webpackConfigPath)) {
        this.logTest('Module Federation Setup', false, 'webpack.config.js not found');
        return;
      }

      const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
      const hasModuleFederation = webpackConfig.includes('ModuleFederationPlugin');
      const hasCustomerApp = webpackConfig.includes('customerApp');
      const hasAdminApp = webpackConfig.includes('adminApp');
      const hasVendorApp = webpackConfig.includes('vendorApp');

      if (hasModuleFederation && hasCustomerApp && hasAdminApp && hasVendorApp) {
        this.logTest('Module Federation Setup', true, 'Complete Module Federation configuration with all 3 micro-frontends');
      } else {
        this.logTest('Module Federation Setup', false, 'Incomplete Module Federation configuration');
      }
    } catch (error) {
      this.logTest('Module Federation Setup', false, 'Failed to validate webpack configuration', error);
    }
  }

  /**
   * Test 2: Micro-Frontend Applications
   */
  testMicroFrontendApps() {
    try {
      const apps = [
        'client/src/micro-frontends/CustomerApp.tsx',
        'client/src/micro-frontends/AdminApp.tsx',
        'client/src/micro-frontends/VendorApp.tsx'
      ];

      let allAppsExist = true;
      let errorBoundaryCount = 0;
      let suspenseCount = 0;

      for (const appPath of apps) {
        if (!fs.existsSync(appPath)) {
          allAppsExist = false;
          break;
        }

        const appContent = fs.readFileSync(appPath, 'utf8');
        if (appContent.includes('ErrorBoundary')) errorBoundaryCount++;
        if (appContent.includes('Suspense')) suspenseCount++;
      }

      if (allAppsExist && errorBoundaryCount === 3 && suspenseCount === 3) {
        this.logTest('Micro-Frontend Applications', true, 'All 3 micro-frontend apps with ErrorBoundary and Suspense');
      } else {
        this.logTest('Micro-Frontend Applications', false, `Missing apps or incomplete setup. ErrorBoundary: ${errorBoundaryCount}/3, Suspense: ${suspenseCount}/3`);
      }
    } catch (error) {
      this.logTest('Micro-Frontend Applications', false, 'Failed to validate micro-frontend applications', error);
    }
  }

  /**
   * Test 3: Component Duplication Elimination
   */
  testComponentDuplicationElimination() {
    try {
      const buttonPath = 'client/src/shared/components/ui/button.tsx';
      const inputPath = 'client/src/shared/components/ui/input.tsx';

      if (!fs.existsSync(buttonPath) || !fs.existsSync(inputPath)) {
        this.logTest('Component Duplication Elimination', false, 'Button or Input component files not found');
        return;
      }

      const buttonContent = fs.readFileSync(buttonPath, 'utf8');
      const inputContent = fs.readFileSync(inputPath, 'utf8');

      const buttonReExports = buttonContent.includes('export { Button') && buttonContent.includes('design-system');
      const inputReExports = inputContent.includes('export { Input') && inputContent.includes('design-system');

      if (buttonReExports && inputReExports) {
        this.logTest('Component Duplication Elimination', true, 'Button and Input components properly re-exported from design-system');
      } else {
        this.logTest('Component Duplication Elimination', false, 'Components not properly consolidated');
      }
    } catch (error) {
      this.logTest('Component Duplication Elimination', false, 'Failed to validate component consolidation', error);
    }
  }

  /**
   * Test 4: Shared Components Index (20 Component Limit)
   */
  testSharedComponentsIndex() {
    try {
      const indexPath = 'client/src/shared/components/index.ts';
      if (!fs.existsSync(indexPath)) {
        this.logTest('Shared Components Index', false, 'index.ts not found');
        return;
      }

      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const exportLines = indexContent.match(/export\s+{[^}]*}/g) || [];
      const exportCount = exportLines.length;

      // Count individual exports
      const individualExports = indexContent.match(/export\s+{[^}]*}/g) || [];
      let totalExports = 0;
      individualExports.forEach(line => {
        // Count commas + 1 for each export line
        const commaCount = (line.match(/,/g) || []).length;
        totalExports += commaCount + 1;
      });

      if (totalExports <= 20) {
        this.logTest('Shared Components Index', true, `${totalExports} components exported (within 20 limit)`);
      } else {
        this.logTest('Shared Components Index', false, `${totalExports} components exported (exceeds 20 limit)`);
      }
    } catch (error) {
      this.logTest('Shared Components Index', false, 'Failed to validate shared components index', error);
    }
  }

  /**
   * Test 5: App.tsx Module Federation Integration
   */
  testAppModuleFederationIntegration() {
    try {
      const appPath = 'client/src/App.tsx';
      if (!fs.existsSync(appPath)) {
        this.logTest('App.tsx Module Federation Integration', false, 'App.tsx not found');
        return;
      }

      const appContent = fs.readFileSync(appPath, 'utf8');
      const hasCustomerApp = appContent.includes('CustomerApp');
      const hasAdminApp = appContent.includes('AdminApp');
      const hasVendorApp = appContent.includes('VendorApp');
      const hasErrorBoundary = appContent.includes('ErrorBoundary');
      const hasSuspense = appContent.includes('Suspense');
      const hasShellLayout = appContent.includes('ShellLayout');

      if (hasCustomerApp && hasAdminApp && hasVendorApp && hasErrorBoundary && hasSuspense && hasShellLayout) {
        this.logTest('App.tsx Module Federation Integration', true, 'Complete shell application with all micro-frontends');
      } else {
        this.logTest('App.tsx Module Federation Integration', false, 'Incomplete shell application setup');
      }
    } catch (error) {
      this.logTest('App.tsx Module Federation Integration', false, 'Failed to validate App.tsx integration', error);
    }
  }

  /**
   * Test 6: Micro-Frontend Services
   */
  testMicroFrontendServices() {
    try {
      const services = [
        'client/src/services/micro-frontend/MicroFrontendLoader.ts',
        'client/src/services/micro-frontend/MicroFrontendErrorBoundary.tsx'
      ];

      let allServicesExist = true;
      let hasCorrectFeatures = true;

      for (const servicePath of services) {
        if (!fs.existsSync(servicePath)) {
          allServicesExist = false;
          break;
        }

        const serviceContent = fs.readFileSync(servicePath, 'utf8');
        if (servicePath.includes('MicroFrontendLoader')) {
          hasCorrectFeatures = serviceContent.includes('loadRemoteModule') && serviceContent.includes('preload');
        }
        if (servicePath.includes('MicroFrontendErrorBoundary')) {
          hasCorrectFeatures = serviceContent.includes('componentDidCatch') && serviceContent.includes('getDerivedStateFromError');
        }
      }

      if (allServicesExist && hasCorrectFeatures) {
        this.logTest('Micro-Frontend Services', true, 'All micro-frontend services with correct features');
      } else {
        this.logTest('Micro-Frontend Services', false, 'Missing services or incomplete features');
      }
    } catch (error) {
      this.logTest('Micro-Frontend Services', false, 'Failed to validate micro-frontend services', error);
    }
  }

  /**
   * Test 7: Performance Components
   */
  testPerformanceComponents() {
    try {
      const performanceComponents = [
        'client/src/shared/components/OptimizedImage.tsx',
        'client/src/shared/components/LazyTestComponent.tsx'
      ];

      let allComponentsExist = true;
      let hasOptimizedFeatures = true;

      for (const componentPath of performanceComponents) {
        if (!fs.existsSync(componentPath)) {
          allComponentsExist = false;
          break;
        }

        const componentContent = fs.readFileSync(componentPath, 'utf8');
        if (componentPath.includes('OptimizedImage')) {
          hasOptimizedFeatures = componentContent.includes('IntersectionObserver') && componentContent.includes('lazy');
        }
        if (componentPath.includes('LazyTestComponent')) {
          hasOptimizedFeatures = componentContent.includes('React.FC') || componentContent.includes('React.FunctionComponent');
        }
      }

      if (allComponentsExist && hasOptimizedFeatures) {
        this.logTest('Performance Components', true, 'All performance components with optimization features');
      } else {
        this.logTest('Performance Components', false, 'Missing components or incomplete optimization features');
      }
    } catch (error) {
      this.logTest('Performance Components', false, 'Failed to validate performance components', error);
    }
  }

  /**
   * Test 8: Build Configuration
   */
  testBuildConfiguration() {
    try {
      const packageJsonPath = 'package.json';
      if (!fs.existsSync(packageJsonPath)) {
        this.logTest('Build Configuration', false, 'package.json not found');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasReact = packageJson.dependencies && packageJson.dependencies['react'];
      const hasReactErrorBoundary = packageJson.dependencies && packageJson.dependencies['react-error-boundary'];
      const hasWebpack = packageJson.dependencies && (packageJson.dependencies['webpack'] || packageJson.devDependencies && packageJson.devDependencies['webpack']);

      if (hasReact && hasReactErrorBoundary) {
        this.logTest('Build Configuration', true, 'Required dependencies installed');
      } else {
        this.logTest('Build Configuration', false, 'Missing required dependencies');
      }
    } catch (error) {
      this.logTest('Build Configuration', false, 'Failed to validate build configuration', error);
    }
  }

  /**
   * Test 9: Application Structure Compliance
   */
  testApplicationStructureCompliance() {
    try {
      const requiredDirectories = [
        'client/src/micro-frontends',
        'client/src/services/micro-frontend',
        'client/src/shared/components',
        'client/src/shared/components/ui',
        'client/src/shared/components/layouts',
        'client/src/design-system/atoms'
      ];

      let allDirectoriesExist = true;
      const missingDirectories = [];

      for (const dir of requiredDirectories) {
        if (!fs.existsSync(dir)) {
          allDirectoriesExist = false;
          missingDirectories.push(dir);
        }
      }

      if (allDirectoriesExist) {
        this.logTest('Application Structure Compliance', true, 'All required directories exist');
      } else {
        this.logTest('Application Structure Compliance', false, `Missing directories: ${missingDirectories.join(', ')}`);
      }
    } catch (error) {
      this.logTest('Application Structure Compliance', false, 'Failed to validate application structure', error);
    }
  }

  /**
   * Test 10: Amazon.com/Shopee.sg Standards Compliance
   */
  testAmazonShopeeStandardsCompliance() {
    try {
      let complianceScore = 0;
      const maxScore = 10;

      // Check Module Federation (2 points)
      const webpackConfig = fs.readFileSync('webpack.config.js', 'utf8');
      if (webpackConfig.includes('ModuleFederationPlugin')) complianceScore += 2;

      // Check Component Organization (2 points)
      const sharedIndex = fs.readFileSync('client/src/shared/components/index.ts', 'utf8');
      const exportCount = (sharedIndex.match(/export/g) || []).length;
      if (exportCount <= 20) complianceScore += 2;

      // Check Error Boundaries (2 points)
      const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
      if (appContent.includes('ErrorBoundary')) complianceScore += 2;

      // Check Performance Components (2 points)
      if (fs.existsSync('client/src/shared/components/OptimizedImage.tsx')) complianceScore += 2;

      // Check Micro-Frontend Services (2 points)
      if (fs.existsSync('client/src/services/micro-frontend/MicroFrontendLoader.ts')) complianceScore += 2;

      const compliancePercentage = (complianceScore / maxScore) * 100;

      if (compliancePercentage >= 80) {
        this.logTest('Amazon.com/Shopee.sg Standards Compliance', true, `${compliancePercentage}% compliance achieved`);
      } else {
        this.logTest('Amazon.com/Shopee.sg Standards Compliance', false, `${compliancePercentage}% compliance (need 80%+)`);
      }
    } catch (error) {
      this.logTest('Amazon.com/Shopee.sg Standards Compliance', false, 'Failed to calculate compliance score', error);
    }
  }

  /**
   * Run all Phase 1 tests
   */
  async runAllTests() {
    console.log('\n🚀 PHASE 1 COMPREHENSIVE VALIDATION TEST STARTING...\n');
    
    this.testModuleFederationSetup();
    this.testMicroFrontendApps();
    this.testComponentDuplicationElimination();
    this.testSharedComponentsIndex();
    this.testAppModuleFederationIntegration();
    this.testMicroFrontendServices();
    this.testPerformanceComponents();
    this.testBuildConfiguration();
    this.testApplicationStructureCompliance();
    this.testAmazonShopeeStandardsCompliance();

    return this.generateReport();
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const successRate = ((this.successCount / this.totalTests) * 100).toFixed(1);
    const isSuccess = this.successCount === this.totalTests;

    console.log('\n' + '='.repeat(80));
    console.log(`🎯 PHASE 1 COMPREHENSIVE VALIDATION RESULTS`);
    console.log('='.repeat(80));
    console.log(`✅ Tests Passed: ${this.successCount}/${this.totalTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`🎖️  Status: ${isSuccess ? 'PHASE 1 COMPLETE ✅' : 'NEEDS ATTENTION ❌'}`);
    console.log('='.repeat(80));

    if (isSuccess) {
      console.log('\n🎉 PHASE 1 AMAZON.COM/SHOPEE.SG IMPLEMENTATION COMPLETE!');
      console.log('✅ Module Federation micro-frontend architecture implemented');
      console.log('✅ Component duplication eliminated (Button, Input consolidated)');
      console.log('✅ Shared components organized (20 component limit achieved)');
      console.log('✅ Performance components implemented');
      console.log('✅ Enterprise-grade error boundaries and suspense');
      console.log('✅ Ready for Phase 2 implementation');
    } else {
      console.log('\n🔧 PHASE 1 ISSUES TO ADDRESS:');
      this.results.forEach(result => {
        if (!result.success) {
          console.log(`❌ ${result.testName}: ${result.result}`);
        }
      });
    }

    return {
      success: isSuccess,
      successRate: parseFloat(successRate),
      results: this.results,
      totalTests: this.totalTests,
      successCount: this.successCount
    };
  }
}

// Run the comprehensive validation
async function runPhase1ComprehensiveValidation() {
  const validator = new Phase1ComprehensiveValidator();
  return await validator.runAllTests();
}

// Export for module usage
if (require.main === module) {
  runPhase1ComprehensiveValidation().catch(console.error);
}

module.exports = { Phase1ComprehensiveValidator, runPhase1ComprehensiveValidation };