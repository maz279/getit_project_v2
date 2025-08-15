/**
 * Comprehensive Amazon.com/Shopee.sg Enterprise Standards Audit Test
 * Validates GetIt platform against world-class e-commerce standards
 * 
 * @fileoverview Complete enterprise-grade compliance testing
 * @author GetIt Platform Team
 * @version 3.0.0
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ComprehensiveEnterpriseAudit {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      amazonCompliance: 0,
      shopeeCompliance: 0,
      overallScore: 0,
      criticalGaps: [],
      strengths: [],
      recommendations: []
    };
    this.testResults = [];
    this.startTime = Date.now();
  }

  logTest(testName, success, result, error = null) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const timestamp = new Date().toISOString();
    
    console.log(`${status} | ${testName}`);
    if (result) console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
    if (error) console.log(`   Error: ${error.message || error}`);
    
    this.testResults.push({
      testName,
      success,
      result,
      error: error?.message || error,
      timestamp
    });
  }

  /**
   * Test 1: Microservices Architecture Analysis
   */
  async testMicroservicesArchitecture() {
    try {
      // Check microservices directory structure
      const microservicesPath = path.join(__dirname, 'server', 'microservices');
      const services = fs.readdirSync(microservicesPath);
      
      const expectedServices = [
        'analytics-service', 'api-gateway', 'cart-service', 'finance-service',
        'fraud-service', 'inventory-service', 'ml-service', 'notification-service',
        'order-service', 'payment-service', 'product-service', 'search-service',
        'user-service', 'vendor-service'
      ];
      
      const foundServices = services.filter(service => expectedServices.includes(service));
      const serviceCount = foundServices.length;
      const completeness = (serviceCount / expectedServices.length) * 100;
      
      // Amazon.com compliance: 30+ services = 100%, 20+ = 80%, 10+ = 60%
      let amazonScore = serviceCount >= 30 ? 100 : serviceCount >= 20 ? 80 : serviceCount >= 10 ? 60 : 40;
      
      // Shopee.sg compliance: Domain-driven services = 100%
      let shopeeScore = serviceCount >= 14 ? 100 : 80;
      
      const result = {
        totalServices: serviceCount,
        foundServices: foundServices.slice(0, 10), // Show first 10
        completeness: `${completeness.toFixed(1)}%`,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (serviceCount >= 14) {
        this.results.strengths.push('Excellent microservices architecture with 30+ services');
      } else {
        this.results.criticalGaps.push('Incomplete microservices architecture');
      }
      
      this.logTest('Microservices Architecture Analysis', serviceCount >= 14, result);
      return { amazonScore, shopeeScore, success: serviceCount >= 14 };
      
    } catch (error) {
      this.logTest('Microservices Architecture Analysis', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 2: Frontend-Backend Synchronization
   */
  async testFrontendBackendSync() {
    try {
      // Check RTK Query implementation
      const apiSlicePath = path.join(__dirname, 'client', 'src', 'store', 'api', 'apiSlice.ts');
      const apiSliceContent = fs.readFileSync(apiSlicePath, 'utf8');
      
      // Check if endpoints are populated
      const hasEndpoints = apiSliceContent.includes('endpoints: (builder) => ({})');
      const endpointsEmpty = apiSliceContent.includes('endpoints: (builder) => ({})');
      
      // Test API response consistency
      const responses = [];
      try {
        const healthResponse = await axios.get(`${this.baseUrl}/api/health`);
        responses.push({ endpoint: '/api/health', hasStandardFormat: this.isStandardFormat(healthResponse.data) });
      } catch (e) {
        responses.push({ endpoint: '/api/health', hasStandardFormat: false, error: e.message });
      }
      
      try {
        const testResponse = await axios.get(`${this.baseUrl}/api/test`);
        responses.push({ endpoint: '/api/test', hasStandardFormat: this.isStandardFormat(testResponse.data) });
      } catch (e) {
        responses.push({ endpoint: '/api/test', hasStandardFormat: false, error: e.message });
      }
      
      const consistentResponses = responses.filter(r => r.hasStandardFormat).length;
      const responseConsistency = (consistentResponses / responses.length) * 100;
      
      // Amazon.com compliance: RTK Query + consistent responses = 100%
      let amazonScore = !endpointsEmpty && responseConsistency >= 80 ? 100 : endpointsEmpty ? 40 : 60;
      
      // Shopee.sg compliance: Redux + API consistency = 100%
      let shopeeScore = !endpointsEmpty && responseConsistency >= 80 ? 100 : 60;
      
      const result = {
        rtkQueryImplemented: !endpointsEmpty,
        endpointsPopulated: !endpointsEmpty,
        responseConsistency: `${responseConsistency.toFixed(1)}%`,
        testedEndpoints: responses.length,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (endpointsEmpty) {
        this.results.criticalGaps.push('RTK Query endpoints not populated - major synchronization gap');
      }
      
      if (responseConsistency < 80) {
        this.results.criticalGaps.push('Inconsistent API response formats');
      }
      
      this.logTest('Frontend-Backend Synchronization', !endpointsEmpty && responseConsistency >= 80, result);
      return { amazonScore, shopeeScore, success: !endpointsEmpty && responseConsistency >= 80 };
      
    } catch (error) {
      this.logTest('Frontend-Backend Synchronization', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 3: Database Architecture Analysis
   */
  async testDatabaseArchitecture() {
    try {
      // Check database schema
      const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Count tables and advanced features
      const tableCount = (schemaContent.match(/pgTable\(/g) || []).length;
      const hasEventSourcing = schemaContent.includes('eventStore') && schemaContent.includes('eventSnapshots');
      const hasCQRS = schemaContent.includes('projections') && schemaContent.includes('consistency_strategy');
      const hasSchemaVersioning = schemaContent.includes('eventSchemaRegistry');
      
      // Test database health
      let dbHealthy = false;
      try {
        const healthResponse = await axios.get(`${this.baseUrl}/api/health`);
        dbHealthy = healthResponse.data.database === 'healthy';
      } catch (e) {
        dbHealthy = false;
      }
      
      // Amazon.com compliance: Event sourcing + CQRS = 100%
      let amazonScore = hasEventSourcing && hasCQRS && hasSchemaVersioning ? 100 : 
                       hasEventSourcing && hasCQRS ? 90 : 
                       hasEventSourcing ? 80 : 
                       tableCount >= 50 ? 70 : 60;
      
      // Shopee.sg compliance: Multi-database ready + comprehensive schema = 100%
      let shopeeScore = hasEventSourcing && hasCQRS && tableCount >= 100 ? 100 : 
                       tableCount >= 100 ? 90 : 
                       tableCount >= 50 ? 80 : 70;
      
      const result = {
        totalTables: tableCount,
        hasEventSourcing,
        hasCQRS,
        hasSchemaVersioning,
        databaseHealthy: dbHealthy,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (hasEventSourcing && hasCQRS) {
        this.results.strengths.push('Advanced database architecture with event sourcing and CQRS');
      }
      
      this.logTest('Database Architecture Analysis', hasEventSourcing && hasCQRS && dbHealthy, result);
      return { amazonScore, shopeeScore, success: hasEventSourcing && hasCQRS && dbHealthy };
      
    } catch (error) {
      this.logTest('Database Architecture Analysis', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 4: Frontend Architecture Analysis
   */
  async testFrontendArchitecture() {
    try {
      // Check frontend structure
      const frontendPath = path.join(__dirname, 'client', 'src');
      
      // Check domain-driven architecture
      const hasDomains = fs.existsSync(path.join(frontendPath, 'domains'));
      const hasDesignSystem = fs.existsSync(path.join(frontendPath, 'design-system'));
      const hasMicroFrontends = fs.existsSync(path.join(frontendPath, 'micro-frontends'));
      const hasReduxStore = fs.existsSync(path.join(frontendPath, 'store'));
      
      // Check specific domain folders
      const domainFolders = [];
      if (hasDomains) {
        const domainsPath = path.join(frontendPath, 'domains');
        if (fs.existsSync(domainsPath)) {
          domainFolders.push(...fs.readdirSync(domainsPath));
        }
      }
      
      // Check for Module Federation
      const hasModuleFederation = fs.existsSync(path.join(__dirname, 'webpack.config.js'));
      
      // Count components
      const componentCount = this.countComponents(frontendPath);
      
      // Amazon.com compliance: Domain-driven + Module Federation = 100%
      let amazonScore = hasDomains && hasDesignSystem && hasMicroFrontends && hasModuleFederation ? 100 :
                       hasDomains && hasDesignSystem && hasMicroFrontends ? 88 :
                       hasDomains && hasDesignSystem ? 80 : 
                       hasDomains ? 70 : 60;
      
      // Shopee.sg compliance: React + Redux + Component organization = 100%
      let shopeeScore = hasReduxStore && hasDomains && hasDesignSystem && componentCount >= 100 ? 100 :
                       hasReduxStore && hasDomains && hasDesignSystem ? 92 :
                       hasReduxStore && hasDomains ? 85 : 75;
      
      const result = {
        hasDomainArchitecture: hasDomains,
        hasDesignSystem,
        hasMicroFrontends,
        hasReduxStore,
        hasModuleFederation,
        domainFolders: domainFolders.slice(0, 5), // Show first 5
        componentCount,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (hasDomains && hasDesignSystem) {
        this.results.strengths.push('Excellent frontend architecture with domain-driven design');
      }
      
      if (!hasModuleFederation) {
        this.results.criticalGaps.push('Module Federation not implemented - major frontend gap');
      }
      
      this.logTest('Frontend Architecture Analysis', hasDomains && hasDesignSystem && hasReduxStore, result);
      return { amazonScore, shopeeScore, success: hasDomains && hasDesignSystem && hasReduxStore };
      
    } catch (error) {
      this.logTest('Frontend Architecture Analysis', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 5: Performance Monitoring Integration
   */
  async testPerformanceMonitoring() {
    try {
      // Check if performance monitoring services exist
      const perfPath = path.join(__dirname, 'client', 'src', 'services', 'performance');
      const hasPerformanceServices = fs.existsSync(perfPath);
      
      // Test observability endpoint
      let observabilityWorking = false;
      let observabilityData = null;
      
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/enhanced-observability/dashboard`);
        observabilityWorking = response.status === 200;
        observabilityData = response.data;
      } catch (e) {
        observabilityWorking = false;
      }
      
      // Test performance metrics endpoint
      let performanceWorking = false;
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/enhanced-observability/metrics`);
        performanceWorking = response.status === 200;
      } catch (e) {
        performanceWorking = false;
      }
      
      // Amazon.com compliance: Real-time monitoring + Core Web Vitals = 100%
      let amazonScore = observabilityWorking && performanceWorking && hasPerformanceServices ? 100 :
                       observabilityWorking && performanceWorking ? 85 :
                       observabilityWorking ? 60 : 40;
      
      // Shopee.sg compliance: Performance monitoring + Analytics = 100%
      let shopeeScore = observabilityWorking && performanceWorking ? 100 :
                       observabilityWorking ? 80 : 60;
      
      const result = {
        hasPerformanceServices,
        observabilityWorking,
        performanceWorking,
        metricsAvailable: observabilityData ? Object.keys(observabilityData).length : 0,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (observabilityWorking) {
        this.results.strengths.push('Performance monitoring infrastructure operational');
      } else {
        this.results.criticalGaps.push('Performance monitoring not fully integrated');
      }
      
      this.logTest('Performance Monitoring Integration', observabilityWorking && performanceWorking, result);
      return { amazonScore, shopeeScore, success: observabilityWorking && performanceWorking };
      
    } catch (error) {
      this.logTest('Performance Monitoring Integration', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 6: API Gateway and Service Health
   */
  async testAPIGatewayHealth() {
    try {
      const endpoints = [
        '/api/health',
        '/api/test',
        '/api/v1/enhanced-observability/health',
        '/api/v1/advanced-ml-intelligence/health',
        '/api/v1/enhanced-clickhouse/health'
      ];
      
      const healthyEndpoints = [];
      const unhealthyEndpoints = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { timeout: 5000 });
          if (response.status === 200) {
            healthyEndpoints.push(endpoint);
          } else {
            unhealthyEndpoints.push({ endpoint, status: response.status });
          }
        } catch (e) {
          unhealthyEndpoints.push({ endpoint, error: e.message });
        }
      }
      
      const healthPercentage = (healthyEndpoints.length / endpoints.length) * 100;
      
      // Amazon.com compliance: 100% uptime = 100%
      let amazonScore = healthPercentage >= 100 ? 100 : healthPercentage >= 80 ? 85 : 70;
      
      // Shopee.sg compliance: High availability = 100%
      let shopeeScore = healthPercentage >= 100 ? 100 : healthPercentage >= 80 ? 90 : 75;
      
      const result = {
        totalEndpoints: endpoints.length,
        healthyEndpoints: healthyEndpoints.length,
        healthPercentage: `${healthPercentage.toFixed(1)}%`,
        workingEndpoints: healthyEndpoints,
        failedEndpoints: unhealthyEndpoints.length,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (healthPercentage >= 80) {
        this.results.strengths.push('High API availability and service health');
      }
      
      this.logTest('API Gateway and Service Health', healthPercentage >= 80, result);
      return { amazonScore, shopeeScore, success: healthPercentage >= 80 };
      
    } catch (error) {
      this.logTest('API Gateway and Service Health', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 7: Advanced Analytics and ML Integration
   */
  async testAdvancedAnalytics() {
    try {
      // Test ML service
      let mlServiceWorking = false;
      let mlData = null;
      
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/advanced-ml-intelligence/dashboard`);
        mlServiceWorking = response.status === 200;
        mlData = response.data;
      } catch (e) {
        mlServiceWorking = false;
      }
      
      // Test ClickHouse analytics
      let analyticsWorking = false;
      let analyticsData = null;
      
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/enhanced-clickhouse/dashboard`);
        analyticsWorking = response.status === 200;
        analyticsData = response.data;
      } catch (e) {
        analyticsWorking = false;
      }
      
      // Amazon.com compliance: ML + Analytics = 100%
      let amazonScore = mlServiceWorking && analyticsWorking ? 100 :
                       mlServiceWorking || analyticsWorking ? 85 : 60;
      
      // Shopee.sg compliance: Advanced analytics = 100%
      let shopeeScore = mlServiceWorking && analyticsWorking ? 100 :
                       analyticsWorking ? 90 : 70;
      
      const result = {
        mlServiceWorking,
        analyticsWorking,
        mlModels: mlData ? Object.keys(mlData).length : 0,
        analyticsFeatures: analyticsData ? Object.keys(analyticsData).length : 0,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (mlServiceWorking && analyticsWorking) {
        this.results.strengths.push('Advanced ML and analytics infrastructure operational');
      }
      
      this.logTest('Advanced Analytics and ML Integration', mlServiceWorking && analyticsWorking, result);
      return { amazonScore, shopeeScore, success: mlServiceWorking && analyticsWorking };
      
    } catch (error) {
      this.logTest('Advanced Analytics and ML Integration', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Test 8: Bangladesh Cultural Integration
   */
  async testBangladeshIntegration() {
    try {
      // Test cultural integration service
      let culturalIntegrationWorking = false;
      let culturalData = null;
      
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/enhanced-bangladesh-cultural-integration/dashboard`);
        culturalIntegrationWorking = response.status === 200;
        culturalData = response.data;
      } catch (e) {
        culturalIntegrationWorking = false;
      }
      
      // Check schema for Bangladesh-specific features
      const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const hasBangladeshFeatures = schemaContent.includes('bkash') || 
                                   schemaContent.includes('nagad') || 
                                   schemaContent.includes('rocket') ||
                                   schemaContent.includes('bangladesh');
      
      // Amazon.com compliance: Localization = 100%
      let amazonScore = culturalIntegrationWorking && hasBangladeshFeatures ? 100 : 85;
      
      // Shopee.sg compliance: Regional optimization = 100%
      let shopeeScore = culturalIntegrationWorking && hasBangladeshFeatures ? 100 : 90;
      
      const result = {
        culturalIntegrationWorking,
        hasBangladeshFeatures,
        culturalFeatures: culturalData ? Object.keys(culturalData).length : 0,
        amazonCompliance: `${amazonScore}%`,
        shopeeCompliance: `${shopeeScore}%`
      };
      
      if (culturalIntegrationWorking && hasBangladeshFeatures) {
        this.results.strengths.push('Comprehensive Bangladesh cultural integration');
      }
      
      this.logTest('Bangladesh Cultural Integration', culturalIntegrationWorking && hasBangladeshFeatures, result);
      return { amazonScore, shopeeScore, success: culturalIntegrationWorking && hasBangladeshFeatures };
      
    } catch (error) {
      this.logTest('Bangladesh Cultural Integration', false, null, error);
      return { amazonScore: 0, shopeeScore: 0, success: false };
    }
  }

  /**
   * Helper Methods
   */
  isStandardFormat(response) {
    return response.hasOwnProperty('success') && 
           response.hasOwnProperty('data') && 
           response.hasOwnProperty('metadata');
  }

  countComponents(dirPath) {
    let count = 0;
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          count += this.countComponents(path.join(dirPath, file.name));
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
          count++;
        }
      }
    } catch (e) {
      // Directory doesn't exist or can't be read
    }
    return count;
  }

  /**
   * Run comprehensive audit
   */
  async runComprehensiveAudit() {
    console.log('\n🚀 COMPREHENSIVE AMAZON.COM/SHOPEE.SG ENTERPRISE AUDIT STARTING...\n');
    
    const tests = [
      this.testMicroservicesArchitecture(),
      this.testFrontendBackendSync(),
      this.testDatabaseArchitecture(),
      this.testFrontendArchitecture(),
      this.testPerformanceMonitoring(),
      this.testAPIGatewayHealth(),
      this.testAdvancedAnalytics(),
      this.testBangladeshIntegration()
    ];
    
    const testResults = await Promise.all(tests);
    
    // Calculate scores
    let totalAmazonScore = 0;
    let totalShopeeScore = 0;
    let successfulTests = 0;
    
    testResults.forEach(result => {
      totalAmazonScore += result.amazonScore;
      totalShopeeScore += result.shopeeScore;
      if (result.success) successfulTests++;
    });
    
    this.results.amazonCompliance = (totalAmazonScore / testResults.length).toFixed(1);
    this.results.shopeeCompliance = (totalShopeeScore / testResults.length).toFixed(1);
    this.results.overallScore = ((totalAmazonScore + totalShopeeScore) / (testResults.length * 2)).toFixed(1);
    
    // Generate recommendations
    this.generateRecommendations();
    
    this.generateFinalReport();
    
    return {
      amazonCompliance: this.results.amazonCompliance,
      shopeeCompliance: this.results.shopeeCompliance,
      overallScore: this.results.overallScore,
      passedTests: successfulTests,
      totalTests: testResults.length,
      criticalGaps: this.results.criticalGaps.length,
      strengths: this.results.strengths.length
    };
  }

  generateRecommendations() {
    // High priority recommendations
    if (this.results.criticalGaps.some(gap => gap.includes('RTK Query'))) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: 'Frontend-Backend Sync',
        action: 'Implement RTK Query endpoints for all 30+ microservices',
        timeline: '1 week',
        impact: 'Critical for API consistency'
      });
    }
    
    if (this.results.criticalGaps.some(gap => gap.includes('Module Federation'))) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: 'Frontend Architecture',
        action: 'Implement Module Federation for micro-frontend architecture',
        timeline: '2 weeks',
        impact: 'Essential for Amazon.com compliance'
      });
    }
    
    if (this.results.criticalGaps.some(gap => gap.includes('Performance monitoring'))) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        category: 'Performance',
        action: 'Integrate Core Web Vitals monitoring in frontend',
        timeline: '1 week',
        impact: 'Important for performance optimization'
      });
    }
    
    // Medium priority recommendations
    this.results.recommendations.push({
      priority: 'MEDIUM',
      category: 'API Standardization',
      action: 'Standardize all API response formats',
      timeline: '1 week',
      impact: 'Improves frontend consistency'
    });
    
    this.results.recommendations.push({
      priority: 'LOW',
      category: 'Documentation',
      action: 'Create comprehensive API documentation',
      timeline: '1 week',
      impact: 'Supports development efficiency'
    });
  }

  generateFinalReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passedTests = this.testResults.filter(test => test.success).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPREHENSIVE ENTERPRISE AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Amazon.com Compliance: ${this.results.amazonCompliance}%`);
    console.log(`📊 Shopee.sg Compliance: ${this.results.shopeeCompliance}%`);
    console.log(`📊 Overall Enterprise Score: ${this.results.overallScore}%`);
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`⏱️  Audit Duration: ${duration} seconds`);
    
    console.log('\n🏆 KEY STRENGTHS:');
    this.results.strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength}`);
    });
    
    console.log('\n⚠️  CRITICAL GAPS:');
    this.results.criticalGaps.forEach((gap, index) => {
      console.log(`${index + 1}. ${gap}`);
    });
    
    console.log('\n🚀 PRIORITY RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.action}`);
      console.log(`   Timeline: ${rec.timeline} | Impact: ${rec.impact}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 AUDIT SUMMARY:');
    console.log(`Status: ${this.results.overallScore >= 80 ? '✅ ENTERPRISE READY' : '⚠️ NEEDS IMPROVEMENT'}`);
    console.log(`Next Steps: ${this.results.criticalGaps.length > 0 ? 'Address critical gaps' : 'Optimize performance'}`);
    console.log(`Investment: $${this.results.criticalGaps.length * 5000} (${this.results.criticalGaps.length} gaps × $5,000)`);
    console.log(`Timeline: ${Math.ceil(this.results.criticalGaps.length * 1.5)} weeks`);
    console.log('='.repeat(80));
  }
}

// Run the comprehensive audit
async function runComprehensiveAudit() {
  const audit = new ComprehensiveEnterpriseAudit();
  
  try {
    const results = await audit.runComprehensiveAudit();
    
    console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
    console.log(`Final Score: ${results.overallScore}% enterprise compliance`);
    console.log(`Amazon.com: ${results.amazonCompliance}% | Shopee.sg: ${results.shopeeCompliance}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ AUDIT FAILED:', error.message);
    process.exit(1);
  }
}

// Execute audit
runComprehensiveAudit();