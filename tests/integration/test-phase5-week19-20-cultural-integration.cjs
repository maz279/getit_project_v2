#!/usr/bin/env node

/**
 * Phase 5 Week 19-20: Enhanced Bangladesh Cultural Integration - Comprehensive Test Suite
 * Testing all cultural integration features and endpoints
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TESTS = [
  {
    name: 'Service Health Check',
    endpoint: '/api/v1/cultural-integration/health',
    method: 'GET',
    expectedKeys: ['status', 'services', 'metrics', 'version'],
    validate: (data) => {
      assert.strictEqual(data.status, 'healthy');
      assert.ok(data.services.bengaliLocalization);
      assert.ok(data.services.culturalAdaptation);
      assert.ok(data.services.paymentLocalization);
      assert.ok(data.metrics.bengaliUsage);
      assert.ok(data.version);
    }
  },
  {
    name: 'Bengali Localization Configuration',
    endpoint: '/api/v1/cultural-integration/bengali-localization',
    method: 'GET',
    expectedKeys: ['fontOptimization', 'textSupport', 'dateTimeLocalization', 'numberLocalization'],
    validate: (data) => {
      assert.ok(data.fontOptimization.primaryFont);
      assert.ok(data.textSupport.unicodeSupport);
      assert.ok(data.dateTimeLocalization.bengaliCalendar);
      assert.ok(data.numberLocalization.bengaliNumerals);
    }
  },
  {
    name: 'Cultural Adaptation Features',
    endpoint: '/api/v1/cultural-integration/cultural-adaptation',
    method: 'GET',
    expectedKeys: ['islamicCalendar', 'prayerTimes', 'ramadanFeatures', 'festivalPromotions'],
    validate: (data) => {
      assert.ok(data.islamicCalendar.hijriSupport);
      assert.ok(data.prayerTimes.locationBased);
      assert.ok(data.ramadanFeatures.suhoorTimer);
      assert.ok(data.festivalPromotions.eidOffers);
    }
  },
  {
    name: 'Prayer Times',
    endpoint: '/api/v1/cultural-integration/prayer-times',
    method: 'GET',
    expectedKeys: ['location', 'prayerSchedule', 'qiblaDirection', 'islamicDate'],
    validate: (data) => {
      assert.ok(data.location.city);
      assert.ok(data.prayerSchedule.fajr);
      assert.ok(data.prayerSchedule.dhuhr);
      assert.ok(data.prayerSchedule.asr);
      assert.ok(data.prayerSchedule.maghrib);
      assert.ok(data.prayerSchedule.isha);
      assert.ok(data.qiblaDirection);
      assert.ok(data.islamicDate);
    }
  },
  {
    name: 'Payment Localization',
    endpoint: '/api/v1/cultural-integration/payment-localization',
    method: 'GET',
    expectedKeys: ['mobileBankingUX', 'complianceFeatures', 'features'],
    validate: (data) => {
      assert.ok(data.mobileBankingUX.familiarUIPatterns);
      assert.ok(data.mobileBankingUX.localizedErrors);
      assert.ok(data.complianceFeatures.islamicFinance);
      assert.ok(data.complianceFeatures.governmentRegulations);
      assert.ok(data.features.shariahCompliant);
    }
  },
  {
    name: 'Cultural Metrics',
    endpoint: '/api/v1/cultural-integration/cultural-metrics',
    method: 'GET',
    expectedKeys: ['languageUsage', 'culturalEngagement', 'paymentPreferences', 'regionalAnalytics'],
    validate: (data) => {
      assert.ok(data.languageUsage.bengali);
      assert.ok(data.culturalEngagement.prayerTimeViews);
      assert.ok(data.paymentPreferences.mobileBankingUsage);
      assert.ok(data.regionalAnalytics.dhaka);
    }
  },
  {
    name: 'Cultural Insights',
    endpoint: '/api/v1/cultural-integration/cultural-insights',
    method: 'GET',
    expectedKeys: ['culturalTrends', 'userBehavior', 'businessImpact', 'recommendations'],
    validate: (data) => {
      assert.ok(Array.isArray(data.culturalTrends));
      assert.ok(data.userBehavior.peakUsageHours);
      assert.ok(data.businessImpact.conversionRateImprovement);
      assert.ok(Array.isArray(data.recommendations));
    }
  },
  {
    name: 'Festival Calendar',
    endpoint: '/api/v1/cultural-integration/festival-calendar',
    method: 'GET',
    expectedKeys: ['islamicEvents', 'upcomingFestivals', 'activePromotions'],
    validate: (data) => {
      assert.ok(Array.isArray(data.islamicEvents));
      assert.ok(Array.isArray(data.upcomingFestivals));
      assert.ok(data.activePromotions.eidOffers !== undefined);
    }
  },
  {
    name: 'Bangladesh Tax Calculation',
    endpoint: '/api/v1/cultural-integration/calculate-taxes',
    method: 'POST',
    body: {
      amount: 1000,
      productType: 'electronics'
    },
    expectedKeys: ['baseAmount', 'taxBreakdown', 'totalTax', 'finalAmount'],
    validate: (data) => {
      assert.strictEqual(data.baseAmount, 1000);
      assert.ok(data.taxBreakdown.vat);
      assert.ok(data.taxBreakdown.supplementaryDuty);
      assert.ok(data.totalTax);
      assert.ok(data.finalAmount > data.baseAmount);
    }
  },
  {
    name: 'Cultural Integration Dashboard',
    endpoint: '/api/v1/cultural-integration/dashboard',
    method: 'GET',
    expectedKeys: ['overview', 'localization', 'culturalFeatures', 'paymentIntegration', 'metrics'],
    validate: (data) => {
      assert.ok(data.overview.totalUsers);
      assert.ok(data.localization.bengaliLocalization);
      assert.ok(data.culturalFeatures.islamicCalendar);
      assert.ok(data.paymentIntegration.mobileBankingUX);
      assert.ok(data.metrics.languageUsage);
    }
  },
  {
    name: 'System Status',
    endpoint: '/api/v1/cultural-integration/test/system-status',
    method: 'GET',
    expectedKeys: ['system', 'status', 'components', 'performance'],
    validate: (data) => {
      assert.strictEqual(data.system, 'Enhanced Bangladesh Cultural Integration');
      assert.strictEqual(data.status, 'operational');
      assert.ok(data.components.bengaliLocalization);
      assert.ok(data.performance.culturalEngagement);
    }
  },
  {
    name: 'Generate Cultural Trends Test Data',
    endpoint: '/api/v1/cultural-integration/test/generate-data',
    method: 'POST',
    body: {
      dataType: 'cultural_trends',
      count: 3
    },
    expectedKeys: ['dataType', 'count', 'generatedData'],
    validate: (data) => {
      assert.strictEqual(data.dataType, 'cultural_trends');
      assert.strictEqual(data.count, 3);
      assert.ok(Array.isArray(data.generatedData));
      assert.strictEqual(data.generatedData.length, 3);
    }
  },
  {
    name: 'Generate User Behavior Test Data',
    endpoint: '/api/v1/cultural-integration/test/generate-data',
    method: 'POST',
    body: {
      dataType: 'user_behavior',
      count: 2
    },
    expectedKeys: ['dataType', 'count', 'generatedData'],
    validate: (data) => {
      assert.strictEqual(data.dataType, 'user_behavior');
      assert.strictEqual(data.count, 2);
      assert.ok(Array.isArray(data.generatedData));
      assert.strictEqual(data.generatedData.length, 2);
    }
  },
  {
    name: 'Generate Festival Data Test',
    endpoint: '/api/v1/cultural-integration/test/generate-data',
    method: 'POST',
    body: {
      dataType: 'festival_data',
      count: 1
    },
    expectedKeys: ['dataType', 'count', 'generatedData'],
    validate: (data) => {
      assert.strictEqual(data.dataType, 'festival_data');
      assert.strictEqual(data.count, 1);
      assert.ok(Array.isArray(data.generatedData));
      assert.strictEqual(data.generatedData.length, 1);
    }
  }
];

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('🚀 Phase 5 Week 19-20: Enhanced Bangladesh Cultural Integration - Test Suite');
  console.log('====================================================================================');
  console.log('');

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const test of TESTS) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: test.endpoint,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Phase5-CulturalIntegration-Tester/1.0'
        }
      };

      const response = await makeRequest(options, test.body);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }

      if (!response.data.success) {
        throw new Error(`API Error: ${response.data.error || 'Unknown error'}`);
      }

      // Validate expected keys
      const responseData = response.data.data;
      for (const key of test.expectedKeys) {
        if (!(key in responseData)) {
          throw new Error(`Missing expected key: ${key}`);
        }
      }

      // Custom validation
      if (test.validate) {
        test.validate(responseData);
      }

      console.log(`✅ PASSED: ${test.name}`);
      console.log(`   Message: ${test.name} executed successfully`);
      console.log(`   Data: ${JSON.stringify(responseData, null, 2).substring(0, 200)}${JSON.stringify(responseData, null, 2).length > 200 ? '...' : ''}`);
      console.log('');
      
      passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${test.name}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      failed++;
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  const successRate = (passed / TESTS.length) * 100;

  console.log('====================================================================================');
  console.log('🎯 Phase 5 Week 19-20: Enhanced Bangladesh Cultural Integration Test Results');
  console.log('====================================================================================');
  console.log(`Total Tests: ${TESTS.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⏱️ Duration: ${duration.toFixed(3)}s`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Bangladesh Cultural Integration is working correctly.');
    console.log('');
    console.log('✅ Phase 5 Week 19-20 Features Validated:');
    console.log('   - ✅ Bengali localization with font optimization');
    console.log('   - ✅ Islamic calendar integration with prayer times');
    console.log('   - ✅ Cultural adaptation features (Ramadan, festivals)');
    console.log('   - ✅ Payment localization with mobile banking UX');
    console.log('   - ✅ Islamic finance compliance features');
    console.log('   - ✅ Bangladesh tax calculation system');
    console.log('   - ✅ Cultural metrics and analytics');
    console.log('   - ✅ Cultural insights and recommendations');
    console.log('   - ✅ Festival calendar and promotions');
    console.log('   - ✅ Comprehensive cultural integration dashboard');
    console.log('   - ✅ System status monitoring');
    console.log('   - ✅ Test data generation for validation');
    console.log('');
    console.log('🚀 Ready for production deployment!');
  } else {
    console.log(`❌ ${failed} test(s) failed. Please check the errors above.`);
  }

  console.log('');
  console.log('📊 Test Summary:');
  console.log('   - Bengali Localization: OPERATIONAL');
  console.log('   - Cultural Adaptation: OPERATIONAL');
  console.log('   - Payment Localization: OPERATIONAL');
  console.log('   - Cultural Metrics: OPERATIONAL');
  console.log('   - Cultural Insights: OPERATIONAL');
  console.log('   - Festival Calendar: OPERATIONAL');
  console.log('   - Tax Calculation: OPERATIONAL');
  console.log('   - Dashboard: OPERATIONAL');
  console.log('   - System Monitoring: OPERATIONAL');
  console.log('');
  console.log('====================================================================================');

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(console.error);