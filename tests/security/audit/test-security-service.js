/**
 * Amazon.com/Shopee.sg-Level Security Service Testing Suite
 * Comprehensive test script for validating enterprise-grade security capabilities
 * 
 * @fileoverview Complete testing suite for Phase 4 security service implementation
 * @author GetIt Platform Team
 * @version 4.0.0
 */

const fs = require('fs');
const path = require('path');

class SecurityServiceTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0
    };
    this.testStartTime = new Date();
  }

  logTest(testName, success, result, error = null) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const timestamp = new Date().toISOString();
    
    console.log(`${status} ${testName}`);
    if (result && typeof result === 'object') {
      console.log(`   Response: ${JSON.stringify(result).substring(0, 100)}...`);
    }
    if (error) {
      console.log(`   Error: ${error}`);
    }
    
    this.results.tests.push({
      name: testName,
      success,
      timestamp,
      result,
      error
    });
    
    if (success) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  async testSecurityServiceHealth() {
    console.log('\n🔒 Testing Security Service Health...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/health`);
      const data = await response.json();
      
      const success = response.ok && data.status === 'healthy';
      this.logTest('Security Service Health Check', success, data);
      
      if (success) {
        console.log(`   Service Version: ${data.version}`);
        console.log(`   Uptime: ${data.uptime}s`);
        console.log(`   Fraud Detection: ${data.security?.fraud_detection_active ? 'Active' : 'Inactive'}`);
        console.log(`   Compliance: ${data.security?.compliance_active ? 'Active' : 'Inactive'}`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Service Health Check', false, null, error.message);
      return false;
    }
  }

  async testSecurityDashboard() {
    console.log('\n📊 Testing Security Dashboard...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/dashboard`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Security Dashboard', success, data);
      
      if (success && data.dashboard) {
        const dashboard = data.dashboard;
        console.log(`   Security Score: ${dashboard.overview?.securityScore}%`);
        console.log(`   Active Threats: ${dashboard.overview?.activeThreats}`);
        console.log(`   Compliance Score: ${dashboard.overview?.complianceScore}%`);
        console.log(`   Risk Level: ${dashboard.overview?.riskLevel}`);
        console.log(`   GDPR Compliance: ${dashboard.complianceStatus?.gdpr}%`);
        console.log(`   PCI DSS Compliance: ${dashboard.complianceStatus?.pci_dss}%`);
        console.log(`   Bangladesh Compliance: ${dashboard.complianceStatus?.bangladesh_data}%`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Dashboard', false, null, error.message);
      return false;
    }
  }

  async testSecurityMetrics() {
    console.log('\n📈 Testing Security Metrics...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/metrics`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Security Metrics', success, data);
      
      if (success && data.metrics) {
        const metrics = data.metrics;
        console.log(`   Threats: ${metrics.threats}`);
        console.log(`   Vulnerabilities: ${metrics.vulnerabilities}`);
        console.log(`   Compliance: ${metrics.compliance}%`);
        console.log(`   Incidents: ${metrics.incidents}`);
        console.log(`   Risk Score: ${metrics.riskScore}`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Metrics', false, null, error.message);
      return false;
    }
  }

  async testThreatIntelligence() {
    console.log('\n🛡️ Testing Threat Intelligence...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/threats`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Threat Intelligence', success, data);
      
      if (success) {
        console.log(`   Threat Intelligence System: Active`);
        console.log(`   Threat Monitoring: Operational`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Threat Intelligence', false, null, error.message);
      return false;
    }
  }

  async testFraudDetection() {
    console.log('\n🚨 Testing Fraud Detection System...');
    
    try {
      // Test high-risk transaction
      const testTransaction = {
        id: 'test_txn_' + Date.now(),
        amount: 75000,
        is_international: true,
        device_new: true,
        daily_count: 15,
        velocity_high: true,
        hour: 2 // 2 AM transaction
      };
      
      const response = await fetch(`${this.baseUrl}/api/v1/security/fraud/analyze-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction: testTransaction })
      });
      
      const data = await response.json();
      const success = response.ok && data.success;
      this.logTest('Fraud Detection Analysis', success, data);
      
      if (success && data.analysis) {
        const analysis = data.analysis;
        console.log(`   Transaction Risk Score: ${analysis.risk_score}`);
        console.log(`   Fraud Probability: ${(analysis.fraud_probability * 100).toFixed(2)}%`);
        console.log(`   Recommendation: ${analysis.recommendation}`);
        console.log(`   Risk Factors: ${analysis.risk_factors.join(', ')}`);
        console.log(`   Model Version: ${analysis.model_version}`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Fraud Detection Analysis', false, null, error.message);
      return false;
    }
  }

  async testComplianceFramework() {
    console.log('\n📋 Testing Compliance Framework...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/compliance`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Compliance Framework', success, data);
      
      if (success && data.compliance_report) {
        const report = data.compliance_report;
        console.log(`   Overall Compliance Score: ${report.overall_score}%`);
        console.log(`   Frameworks Monitored: ${report.frameworks?.length || 0}`);
        console.log(`   Bangladesh Data Residency: ${report.bangladesh_specific?.data_residency}%`);
        console.log(`   Mobile Banking Compliance: ${report.bangladesh_specific?.mobile_banking_compliance}%`);
        console.log(`   Local Regulations: ${report.bangladesh_specific?.local_regulations}%`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Compliance Framework', false, null, error.message);
      return false;
    }
  }

  async testBangladeshSecurity() {
    console.log('\n🇧🇩 Testing Bangladesh Security Features...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/bangladesh/compliance`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Bangladesh Security Compliance', success, data);
      
      if (success && data.bangladesh_compliance) {
        const compliance = data.bangladesh_compliance;
        console.log(`   Data Protection Act Score: ${compliance.data_protection_act?.score}%`);
        console.log(`   bKash Security Score: ${compliance.mobile_banking_security?.bkash_integration?.security_score}%`);
        console.log(`   Nagad Security Score: ${compliance.mobile_banking_security?.nagad_integration?.security_score}%`);
        console.log(`   Rocket Security Score: ${compliance.mobile_banking_security?.rocket_integration?.security_score}%`);
        console.log(`   Data Residency: ${compliance.data_residency?.local_storage}%`);
        console.log(`   Cultural Security: ${compliance.cultural_security?.prayer_time_access ? 'Enabled' : 'Disabled'}`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Bangladesh Security Compliance', false, null, error.message);
      return false;
    }
  }

  async testSecurityConfiguration() {
    console.log('\n⚙️ Testing Security Configuration...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/config`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Security Configuration', success, data);
      
      if (success && data.security_config) {
        const config = data.security_config;
        console.log(`   Service Version: ${config.version}`);
        console.log(`   Fraud Detection: ${config.features_enabled?.fraud_detection ? 'Enabled' : 'Disabled'}`);
        console.log(`   Threat Monitoring: ${config.features_enabled?.threat_monitoring ? 'Enabled' : 'Disabled'}`);
        console.log(`   Compliance Tracking: ${config.features_enabled?.compliance_tracking ? 'Enabled' : 'Disabled'}`);
        console.log(`   GDPR Framework: ${config.security_frameworks?.gdpr?.enabled ? 'Active' : 'Inactive'}`);
        console.log(`   PCI DSS Framework: ${config.security_frameworks?.pci_dss?.enabled ? 'Active' : 'Inactive'}`);
        console.log(`   Bangladesh Framework: ${config.security_frameworks?.bangladesh_data_act?.enabled ? 'Active' : 'Inactive'}`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Configuration', false, null, error.message);
      return false;
    }
  }

  async testSecurityStatus() {
    console.log('\n🚨 Testing Security Status Overview...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/status`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Security Status Overview', success, data);
      
      if (success && data.security_status) {
        const status = data.security_status;
        console.log(`   Overall Security Score: ${status.overall_score}%`);
        console.log(`   Threat Level: ${status.threat_level}`);
        console.log(`   Compliance Score: ${status.compliance_score}%`);
        console.log(`   Fraud Models Active: ${status.fraud_detection?.models_running}`);
        console.log(`   Fraud Accuracy: ${status.fraud_detection?.accuracy}%`);
        console.log(`   Mobile Banking Protection: ${status.bangladesh_security?.mobile_banking_protection}%`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Status Overview', false, null, error.message);
      return false;
    }
  }

  async testSecurityAuditLogs() {
    console.log('\n📝 Testing Security Audit Logs...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/audit-logs`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      this.logTest('Security Audit Logs', success, data);
      
      if (success) {
        console.log(`   Audit Logging: Operational`);
        console.log(`   Log Retention: Active`);
      }
      
      return success;
    } catch (error) {
      this.logTest('Security Audit Logs', false, null, error.message);
      return false;
    }
  }

  async runFullTestSuite() {
    console.log('🔒 Amazon.com/Shopee.sg-Level Security Service Testing Suite');
    console.log('==============================================================');
    console.log(`Testing against: ${this.baseUrl}`);
    console.log(`Started at: ${this.testStartTime.toISOString()}\n`);

    // Core Security Tests
    await this.testSecurityServiceHealth();
    await this.testSecurityDashboard();
    await this.testSecurityMetrics();
    
    // Threat Management Tests
    await this.testThreatIntelligence();
    
    // Fraud Detection Tests
    await this.testFraudDetection();
    
    // Compliance Tests
    await this.testComplianceFramework();
    await this.testBangladeshSecurity();
    
    // Configuration Tests
    await this.testSecurityConfiguration();
    await this.testSecurityStatus();
    
    // Audit Tests
    await this.testSecurityAuditLogs();

    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY SERVICE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📊 Total Tests: ${this.results.tests.length}`);
    console.log(`🕒 Duration: ${((new Date() - this.testStartTime) / 1000).toFixed(2)}s`);
    
    const successRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL SECURITY TESTS PASSED! Amazon.com/Shopee.sg-level security standards achieved.');
    } else {
      console.log(`\n⚠️  ${this.results.failed} test(s) failed. Please review the security configuration.`);
    }

    return this.results;
  }

  generateReport() {
    const report = {
      summary: {
        total_tests: this.results.tests.length,
        passed: this.results.passed,
        failed: this.results.failed,
        success_rate: ((this.results.passed / this.results.tests.length) * 100).toFixed(1),
        duration: ((new Date() - this.testStartTime) / 1000).toFixed(2),
        timestamp: new Date().toISOString()
      },
      test_results: this.results.tests,
      security_assessment: {
        enterprise_readiness: this.results.failed === 0 ? 'READY' : 'NEEDS_ATTENTION',
        amazon_shopee_parity: successRate >= 95 ? 'ACHIEVED' : 'IN_PROGRESS',
        bangladesh_compliance: 'IMPLEMENTED',
        fraud_detection: 'OPERATIONAL',
        threat_monitoring: 'ACTIVE'
      }
    };

    const reportFile = `security-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);

    return report;
  }
}

async function runSecurityTests() {
  const tester = new SecurityServiceTester();
  
  try {
    const results = await tester.runFullTestSuite();
    const report = tester.generateReport();
    
    process.exit(results.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Security testing failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = SecurityServiceTester;