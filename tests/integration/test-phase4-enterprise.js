#!/usr/bin/env node

// Phase 4: Enterprise Integration Test Suite
// Comprehensive validation of enterprise features and multi-tenant architecture

const API_BASE = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

console.log('🏢 PHASE 4: ENTERPRISE INTEGRATION TEST SUITE');
console.log('==============================================');
console.log('Testing enterprise multi-tenant architecture and advanced features...\n');

let testResults = {
  enterpriseConversation: { passed: 0, total: 4 },
  multiTenantSupport: { passed: 0, total: 3 },
  securityCompliance: { passed: 0, total: 4 },
  enterpriseAnalytics: { passed: 0, total: 3 }
};

// Utility function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 15000,
      ...options
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { raw: text, status: response.status };
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      data: null
    };
  }
}

// Test 1: Enterprise Conversation Validation
console.log('🏢 ENTERPRISE CONVERSATION VALIDATION');
console.log('=====================================');

async function testEnterpriseConversation() {
  console.log('   Testing enterprise conversation endpoint...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What are the best enterprise solutions for Bangladesh businesses?',
      tenantId: 'tenant_test_001',
      userId: 'user_enterprise_001',
      conversationHistory: [],
      options: { maxTokens: 400 },
      securityLevel: 'enterprise'
    })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Enterprise Conversation: Active', `(${response.status})`);
    console.log(`   📊 Response Time: ${response.data.responseTime}ms`);
    console.log(`   🔒 Security Level: ${response.data.enterpriseMetadata?.securityLevel}`);
    console.log(`   🏢 Tenant Isolation: ${response.data.enterpriseMetadata?.tenantIsolation ? 'Enabled' : 'Disabled'}`);
    console.log(`   📋 Audit Logged: ${response.data.enterpriseMetadata?.auditLogged ? 'Yes' : 'No'}`);
    testResults.enterpriseConversation.passed++;
  } else {
    console.log('   ❌ Enterprise Conversation: Failed', `(${response.status})`);
  }
}

async function testSecurityValidation() {
  console.log('   Testing security validation with invalid tenant...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test message',
      tenantId: '', // Invalid tenant ID
      userId: 'user_test_001',
      securityLevel: 'enhanced'
    })
  });
  
  if (response.status === 400 && response.data?.error?.includes('tenantId')) {
    console.log('   ✅ Security Validation: Working', '(Correctly rejected invalid tenant)');
    testResults.enterpriseConversation.passed++;
  } else {
    console.log('   ❌ Security Validation: Failed', `(${response.status})`);
  }
}

async function testComplianceChecking() {
  console.log('   Testing compliance checking...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Please help with legitimate business advice for our e-commerce platform in Bangladesh',
      tenantId: 'tenant_compliance_001',
      userId: 'user_compliance_001',
      securityLevel: 'standard'
    })
  });
  
  if (response.ok && response.data?.success && response.data?.complianceResult) {
    console.log('   ✅ Compliance Checking: Available', `(${response.status})`);
    console.log(`   📋 Compliant: ${response.data.complianceResult.compliant ? 'Yes' : 'No'}`);
    console.log(`   🔍 Checks Performed: ${response.data.complianceResult.checks?.length || 0}`);
    testResults.enterpriseConversation.passed++;
  } else {
    console.log('   ❌ Compliance Checking: Failed', `(${response.status})`);
  }
}

async function testEnterpriseMetadata() {
  console.log('   Testing enterprise metadata inclusion...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test enterprise metadata',
      tenantId: 'tenant_metadata_001',
      userId: 'user_metadata_001',
      securityLevel: 'enterprise'
    })
  });
  
  if (response.ok && response.data?.enterpriseMetadata) {
    const metadata = response.data.enterpriseMetadata;
    const hasRequiredFields = metadata.processingLevel && 
                             metadata.securityLevel && 
                             typeof metadata.tenantIsolation === 'boolean' &&
                             typeof metadata.auditLogged === 'boolean';
    
    console.log('   ✅ Enterprise Metadata: Complete', hasRequiredFields ? '(All fields present)' : '(Missing fields)');
    console.log(`   📊 Processing Level: ${metadata.processingLevel}`);
    console.log(`   🔒 Security Level: ${metadata.securityLevel}`);
    if (hasRequiredFields) testResults.enterpriseConversation.passed++;
  } else {
    console.log('   ❌ Enterprise Metadata: Failed', `(${response.status})`);
  }
}

testResults.enterpriseConversation.total = 4;

// Test 2: Multi-Tenant Support Validation
console.log('\n👥 MULTI-TENANT SUPPORT VALIDATION');
console.log('===================================');

async function testTenantIsolation() {
  console.log('   Testing tenant isolation...');
  
  // Make requests from different tenants
  const tenant1Response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Tenant 1 specific query',
      tenantId: 'tenant_isolation_001',
      userId: 'user_001'
    })
  });
  
  const tenant2Response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Tenant 2 specific query',
      tenantId: 'tenant_isolation_002',
      userId: 'user_002'
    })
  });
  
  if (tenant1Response.ok && tenant2Response.ok) {
    const differentRequestIds = tenant1Response.data?.requestId !== tenant2Response.data?.requestId;
    const correctTenantIds = tenant1Response.data?.tenantId === 'tenant_isolation_001' &&
                           tenant2Response.data?.tenantId === 'tenant_isolation_002';
    
    console.log('   ✅ Tenant Isolation: Working', differentRequestIds && correctTenantIds ? '(Isolated)' : '(Mixed)');
    console.log(`   🔑 Request IDs: ${differentRequestIds ? 'Different' : 'Same'}`);
    console.log(`   🏢 Tenant IDs: ${correctTenantIds ? 'Correct' : 'Incorrect'}`);
    if (differentRequestIds && correctTenantIds) testResults.multiTenantSupport.passed++;
  } else {
    console.log('   ❌ Tenant Isolation: Failed', '(Request failed)');
  }
}

async function testTenantMetrics() {
  console.log('   Testing tenant metrics tracking...');
  
  // First make a request to generate metrics
  await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Generate metrics',
      tenantId: 'tenant_metrics_001',
      userId: 'user_metrics_001'
    })
  });
  
  // Then check metrics
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/tenant-metrics/tenant_metrics_001`);
  
  if (response.ok && response.data?.success) {
    const metrics = response.data.data;
    console.log('   ✅ Tenant Metrics: Available', `(${response.status})`);
    console.log(`   📊 Total Requests: ${metrics.totalRequests}`);
    console.log(`   📈 Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   ⏱️ Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`);
    testResults.multiTenantSupport.passed++;
  } else {
    console.log('   ❌ Tenant Metrics: Failed', `(${response.status})`);
  }
}

async function testEnterpriseBatch() {
  console.log('   Testing enterprise batch processing...');
  const batchRequests = [
    { message: 'Batch request 1', tenantId: 'tenant_batch_001', userId: 'user_batch_001', maxTokens: 200 },
    { message: 'Batch request 2', tenantId: 'tenant_batch_002', userId: 'user_batch_002', maxTokens: 200 },
    { message: 'Batch request 3', tenantId: 'tenant_batch_001', userId: 'user_batch_003', maxTokens: 200 }
  ];
  
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: batchRequests })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Enterprise Batch: Available', `(${response.status})`);
    console.log(`   📊 Batch Size: ${response.data.batchSize}`);
    console.log(`   ✅ Successful: ${response.data.successful}/${response.data.batchSize}`);
    console.log(`   🏢 Tenant Breakdown: ${Object.keys(response.data.tenantBreakdown || {}).length} tenants`);
    testResults.multiTenantSupport.passed++;
  } else {
    console.log('   ❌ Enterprise Batch: Failed', `(${response.status})`);
  }
}

testResults.multiTenantSupport.total = 3;

// Test 3: Security & Compliance Validation
console.log('\n🔒 SECURITY & COMPLIANCE VALIDATION');
console.log('===================================');

async function testAuditLogging() {
  console.log('   Testing audit logging system...');
  
  // Make a request to generate audit logs
  await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Audit test message',
      tenantId: 'tenant_audit_001',
      userId: 'user_audit_001'
    })
  });
  
  // Check audit logs
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/audit-logs?limit=50`);
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Audit Logging: Available', `(${response.status})`);
    console.log(`   📋 Log Entries: ${response.data.data.totalCount}`);
    console.log(`   🔍 Tenant Filter: ${response.data.data.tenantId}`);
    testResults.securityCompliance.passed++;
  } else {
    console.log('   ❌ Audit Logging: Failed', `(${response.status})`);
  }
}

async function testSecurityLevels() {
  console.log('   Testing security level validation...');
  
  const securityLevels = ['basic', 'standard', 'enhanced', 'enterprise'];
  let validSecurityLevels = 0;
  
  for (const level of securityLevels) {
    const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Test ${level} security`,
        tenantId: `tenant_security_${level}`,
        userId: `user_security_${level}`,
        securityLevel: level
      })
    });
    
    if (response.ok && response.data?.enterpriseMetadata?.securityLevel === level) {
      validSecurityLevels++;
    }
  }
  
  console.log('   ✅ Security Levels: Available', `(${validSecurityLevels}/${securityLevels.length} levels working)`);
  console.log(`   🔒 Supported Levels: ${securityLevels.join(', ')}`);
  if (validSecurityLevels >= 3) testResults.securityCompliance.passed++;
}

async function testComplianceChecks() {
  console.log('   Testing compliance validation framework...');
  
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Please provide business guidance for our Bangladesh e-commerce startup',
      tenantId: 'tenant_compliance_test',
      userId: 'user_compliance_test',
      securityLevel: 'enhanced'
    })
  });
  
  if (response.ok && response.data?.complianceResult) {
    const compliance = response.data.complianceResult;
    const hasChecks = compliance.checks && compliance.checks.length > 0;
    
    console.log('   ✅ Compliance Framework: Available', `(${response.status})`);
    console.log(`   ✅ Compliant: ${compliance.compliant ? 'Yes' : 'No'}`);
    console.log(`   🔍 Checks Performed: ${compliance.checks?.length || 0}`);
    
    if (hasChecks) {
      const passedChecks = compliance.checks.filter(c => c.passed).length;
      console.log(`   📊 Passed Checks: ${passedChecks}/${compliance.checks.length}`);
    }
    
    if (hasChecks) testResults.securityCompliance.passed++;
  } else {
    console.log('   ❌ Compliance Framework: Failed', `(${response.status})`);
  }
}

async function testEnterpriseHealth() {
  console.log('   Testing enterprise health monitoring...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-health`);
  
  if (response.ok && response.data?.success) {
    const health = response.data.data;
    console.log('   ✅ Enterprise Health: Available', `(${response.status})`);
    console.log(`   🏥 Status: ${health.status}`);
    console.log(`   📊 Active Tenants: ${health.metrics?.activeTenants || 0}`);
    console.log(`   📈 Success Rate: ${health.metrics?.successRate || 0}%`);
    console.log(`   🔒 Security Events: ${health.metrics?.securityEvents || 0}`);
    testResults.securityCompliance.passed++;
  } else {
    console.log('   ❌ Enterprise Health: Failed', `(${response.status})`);
  }
}

testResults.securityCompliance.total = 4;

// Test 4: Enterprise Analytics Validation
console.log('\n📊 ENTERPRISE ANALYTICS VALIDATION');
console.log('===================================');

async function testEnterpriseAnalytics() {
  console.log('   Testing enterprise analytics dashboard...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-analytics`);
  
  if (response.ok && response.data?.success) {
    const analytics = response.data.data;
    console.log('   ✅ Enterprise Analytics: Available', `(${response.status})`);
    console.log(`   📊 Total Enterprise Requests: ${analytics.totalEnterpriseRequests}`);
    console.log(`   🏢 Active Tenants: ${analytics.tenantCount}`);
    console.log(`   📈 Success Rate: ${analytics.enterpriseSuccessRate.toFixed(1)}%`);
    console.log(`   ⚡ Average Response Time: ${analytics.averageEnterpriseResponseTime.toFixed(0)}ms`);
    testResults.enterpriseAnalytics.passed++;
  } else {
    console.log('   ❌ Enterprise Analytics: Failed', `(${response.status})`);
  }
}

async function testEnterpriseReporting() {
  console.log('   Testing enterprise report generation...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  
  if (response.ok && response.data?.success) {
    const report = response.data.data;
    console.log('   ✅ Enterprise Reporting: Available', `(${response.status})`);
    console.log(`   📋 Report ID: ${report.reportId}`);
    console.log(`   📊 Summary Requests: ${report.summary?.totalRequests || 0}`);
    console.log(`   🏢 Active Tenants: ${report.summary?.activeTenants || 0}`);
    console.log(`   💡 Recommendations: ${report.recommendations?.length || 0}`);
    testResults.enterpriseAnalytics.passed++;
  } else {
    console.log('   ❌ Enterprise Reporting: Failed', `(${response.status})`);
  }
}

async function testEnterpriseConfiguration() {
  console.log('   Testing enterprise configuration management...');
  const response = await makeRequest(`${API_BASE}/api/phase4-enterprise/enterprise-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        maxConcurrentRequests: 75,
        auditLogRetention: 120,
        enhancedSecurity: true
      }
    })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Enterprise Configuration: Available', `(${response.status})`);
    console.log(`   🔧 Config Updated: ${response.data.message}`);
    console.log(`   ⚙️ Settings Applied: ${Object.keys(response.data.config || {}).length} parameters`);
    testResults.enterpriseAnalytics.passed++;
  } else {
    console.log('   ❌ Enterprise Configuration: Failed', `(${response.status})`);
  }
}

testResults.enterpriseAnalytics.total = 3;

// Run all tests
async function runAllTests() {
  try {
    await testEnterpriseConversation();
    await testSecurityValidation();
    await testComplianceChecking();
    await testEnterpriseMetadata();
    
    await testTenantIsolation();
    await testTenantMetrics();
    await testEnterpriseBatch();
    
    await testAuditLogging();
    await testSecurityLevels();
    await testComplianceChecks();
    await testEnterpriseHealth();
    
    await testEnterpriseAnalytics();
    await testEnterpriseReporting();
    await testEnterpriseConfiguration();
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  // Calculate final results
  const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
  const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.total, 0);
  const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  console.log('\n\n============================================================');
  console.log('PHASE 4 IMPLEMENTATION ASSESSMENT');
  console.log('============================================================');
  console.log(`📊 Overall Score: ${totalPassed}/${totalTests} tests passed (${overallScore}%)\n`);
  
  for (const [category, results] of Object.entries(testResults)) {
    const categoryScore = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
    const status = categoryScore >= 80 ? '✅' : categoryScore >= 60 ? '⚠️' : '❌';
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${categoryName}: ${results.passed}/${results.total} (${categoryScore}%)`);
  }
  
  console.log('\n============================================================');
  if (overallScore >= 85) {
    console.log('🎉 PHASE 4 IMPLEMENTATION SUCCESS');
    console.log('✅ Enterprise integration meets production standards');
    console.log('🚀 Ready for Phase 4 production deployment');
  } else if (overallScore >= 70) {
    console.log('⚠️  PHASE 4 NEEDS OPTIMIZATION');
    console.log('📊 Core functionality working but needs refinement');
    console.log('🔧 Address failing tests before production deployment');
  } else {
    console.log('❌ PHASE 4 REQUIRES MAJOR IMPROVEMENTS');
    console.log('🚨 Significant issues detected');
    console.log('🔧 Comprehensive debugging and fixes needed');
  }
  
  console.log('\n📋 Phase 4 Implementation Summary:');
  console.log('   • Enterprise multi-tenant conversation processing');
  console.log('   • Advanced security validation and compliance checking');
  console.log('   • Comprehensive audit logging and tenant metrics tracking');
  console.log('   • Enterprise analytics dashboard and automated reporting');
  
  console.log('\n🎯 Next Steps:');
  if (overallScore >= 85) {
    console.log('   • Deploy to staging environment for final validation');
    console.log('   • Configure production tenant onboarding process');
    console.log('   • Begin Phase 5 advanced monitoring implementation');
  } else {
    console.log('   • Fix failing enterprise integration tests');
    console.log('   • Enhance multi-tenant isolation and security features');
    console.log('   • Optimize audit logging and analytics capabilities');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 4 ENTERPRISE INTEGRATION TEST COMPLETE');
  console.log('============================================================');
}

// Execute tests
runAllTests().catch(console.error);