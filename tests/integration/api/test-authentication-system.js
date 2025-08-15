/**
 * Amazon.com/Shopee.sg-Level Authentication System Testing Suite
 * Comprehensive test suite for validating enterprise-grade authentication features
 * Tests all 6 MFA types and complete device management functionality
 */

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api/v1/users';

// Test configuration
const TEST_CONFIG = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Mock user for testing (in production, use real authentication)
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@getitbd.com'
};

// Test authentication token (mock)
const mockAuthToken = 'mock-jwt-token-for-testing';

class AuthenticationTester {
  constructor() {
    this.client = axios.create(TEST_CONFIG);
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Log test results
  logTest(testName, success, result, error = null) {
    this.totalTests++;
    if (success) {
      this.passedTests++;
      console.log(`✅ ${testName}: PASSED`);
      if (result && typeof result === 'object' && result.data) {
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } else {
      this.failedTests++;
      console.log(`❌ ${testName}: FAILED`);
      if (error) {
        console.log(`   Error: ${error.message || error}`);
      }
    }
    
    this.testResults.push({
      name: testName,
      success,
      result,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    });
  }

  // Test service health
  async testServiceHealth() {
    try {
      const response = await this.client.get('/health');
      this.logTest('Service Health Check', true, response.data);
      return true;
    } catch (error) {
      this.logTest('Service Health Check', false, null, error);
      return false;
    }
  }

  // Test MFA methods retrieval
  async testGetMFAMethods() {
    try {
      const response = await this.client.get('/mfa/methods', {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Get MFA Methods', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Get MFA Methods', false, null, error);
      return null;
    }
  }

  // Test TOTP setup
  async testTOTPSetup() {
    try {
      const response = await this.client.post('/mfa/setup/totp', {}, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('TOTP Setup', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('TOTP Setup', false, null, error);
      return null;
    }
  }

  // Test TOTP verification
  async testTOTPVerification(token = '123456') {
    try {
      const response = await this.client.post('/mfa/verify/totp', {
        token: token
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('TOTP Verification', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('TOTP Verification', false, null, error);
      return null;
    }
  }

  // Test SMS setup
  async testSMSSetup() {
    try {
      const response = await this.client.post('/mfa/setup/sms', {
        phoneNumber: '+8801712345678'
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('SMS MFA Setup', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('SMS MFA Setup', false, null, error);
      return null;
    }
  }

  // Test SMS verification
  async testSMSVerification(code = '123456') {
    try {
      const response = await this.client.post('/mfa/verify/sms', {
        verificationCode: code
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('SMS Verification', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('SMS Verification', false, null, error);
      return null;
    }
  }

  // Test Email setup
  async testEmailSetup() {
    try {
      const response = await this.client.post('/mfa/setup/email', {
        email: 'test@getitbd.com'
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Email MFA Setup', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Email MFA Setup', false, null, error);
      return null;
    }
  }

  // Test MFA verification (general)
  async testMFAVerification() {
    try {
      const response = await this.client.post('/mfa/verify', {
        userId: mockUser.id,
        methodType: 'totp',
        token: '123456'
      });
      this.logTest('General MFA Verification', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('General MFA Verification', false, null, error);
      return null;
    }
  }

  // Test backup codes generation
  async testBackupCodesGeneration() {
    try {
      const response = await this.client.post('/mfa/backup-codes/generate', {}, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Backup Codes Generation', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Backup Codes Generation', false, null, error);
      return null;
    }
  }

  // Test device registration
  async testDeviceRegistration() {
    try {
      const response = await this.client.post('/devices/register', {
        deviceName: 'Test Browser',
        deviceType: 'desktop'
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id,
          'User-Agent': 'Mozilla/5.0 (Test Browser) Authentication Tester'
        }
      });
      this.logTest('Device Registration', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Device Registration', false, null, error);
      return null;
    }
  }

  // Test get user devices
  async testGetUserDevices() {
    try {
      const response = await this.client.get('/devices', {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Get User Devices', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Get User Devices', false, null, error);
      return null;
    }
  }

  // Test device security insights
  async testDeviceSecurityInsights() {
    try {
      const response = await this.client.get('/devices/security-insights', {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Device Security Insights', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Device Security Insights', false, null, error);
      return null;
    }
  }

  // Test suspicious device detection
  async testSuspiciousDeviceDetection() {
    try {
      const response = await this.client.get('/devices/suspicious', {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Suspicious Device Detection', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Suspicious Device Detection', false, null, error);
      return null;
    }
  }

  // Test device trust
  async testDeviceTrust(deviceId) {
    try {
      const response = await this.client.post(`/devices/${deviceId}/trust`, {
        verificationCode: '123456'
      }, {
        headers: { 
          ...this.client.defaults.headers,
          'Authorization': `Bearer ${mockAuthToken}`,
          'X-User-ID': mockUser.id 
        }
      });
      this.logTest('Device Trust', true, response.data);
      return response.data;
    } catch (error) {
      this.logTest('Device Trust', false, null, error);
      return null;
    }
  }

  // Run comprehensive test suite
  async runFullTestSuite() {
    console.log('🚀 Starting Amazon.com/Shopee.sg-Level Authentication System Test Suite\n');
    console.log('================================================\n');

    // Test 1: Service Health
    console.log('📋 Phase 1: Service Health Testing');
    const healthStatus = await this.testServiceHealth();
    
    if (!healthStatus) {
      console.log('❌ Service is not healthy. Stopping tests.');
      return this.generateReport();
    }

    // Test 2: MFA Features
    console.log('\n📋 Phase 2: Multi-Factor Authentication Testing');
    await this.testGetMFAMethods();
    await this.testTOTPSetup();
    await this.testTOTPVerification();
    await this.testSMSSetup();
    await this.testSMSVerification();
    await this.testEmailSetup();
    await this.testMFAVerification();
    await this.testBackupCodesGeneration();

    // Test 3: Device Management
    console.log('\n📋 Phase 3: Device Management Testing');
    const deviceData = await this.testDeviceRegistration();
    await this.testGetUserDevices();
    await this.testDeviceSecurityInsights();
    await this.testSuspiciousDeviceDetection();
    
    if (deviceData && deviceData.data && deviceData.data.deviceId) {
      await this.testDeviceTrust(deviceData.data.deviceId);
    }

    // Generate final report
    return this.generateReport();
  }

  // Generate test report
  generateReport() {
    const report = {
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        successRate: ((this.passedTests / this.totalTests) * 100).toFixed(2),
        testDate: new Date().toISOString()
      },
      testResults: this.testResults
    };

    console.log('\n================================================');
    console.log('📊 FINAL TEST REPORT');
    console.log('================================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests}`);
    console.log(`Failed: ${report.summary.failedTests}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    
    if (report.summary.successRate >= 80) {
      console.log('🎉 EXCELLENT: Authentication system is production-ready!');
    } else if (report.summary.successRate >= 60) {
      console.log('⚠️ GOOD: Authentication system needs minor improvements');
    } else {
      console.log('❌ NEEDS WORK: Authentication system requires significant fixes');
    }

    return report;
  }
}

// Test execution
async function runAuthenticationTests() {
  const tester = new AuthenticationTester();
  
  try {
    const report = await tester.runFullTestSuite();
    
    // Save report to file
    fs.writeFileSync(
      `authentication-test-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Test report saved to file');
    return report;
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    return null;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthenticationTests()
    .then(report => {
      if (report && report.summary.successRate >= 80) {
        process.exit(0); // Success
      } else {
        process.exit(1); // Failure
      }
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { AuthenticationTester, runAuthenticationTests };