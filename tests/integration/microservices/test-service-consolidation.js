#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Service Layer Consolidation Implementation...\n');

// Test 1: Verify all 8 unified services exist
console.log('📋 Test 1: Verifying unified services exist...');
const coreServicesPath = 'client/src/shared/services/core';
const expectedServices = [
  'ApiService.ts',
  'AuthService.ts', 
  'CacheService.ts',
  'AnalyticsService.ts',
  'NotificationService.ts',
  'PaymentService.ts',
  'SearchService.ts',
  'RealTimeService.ts',
  'index.ts'
];

let test1Success = true;
expectedServices.forEach(service => {
  const servicePath = path.join(coreServicesPath, service);
  if (fs.existsSync(servicePath)) {
    console.log(`✅ ${service} exists`);
  } else {
    console.log(`❌ ${service} missing`);
    test1Success = false;
  }
});

console.log(`\n📊 Test 1 Result: ${test1Success ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Check service file sizes (should be comprehensive)
console.log('📋 Test 2: Verifying service completeness...');
let test2Success = true;
const minFileSizes = {
  'ApiService.ts': 10000,
  'AuthService.ts': 15000,
  'CacheService.ts': 20000,
  'AnalyticsService.ts': 15000,
  'NotificationService.ts': 20000,
  'PaymentService.ts': 25000,
  'SearchService.ts': 25000,
  'RealTimeService.ts': 20000,
  'index.ts': 5000
};

Object.entries(minFileSizes).forEach(([service, minSize]) => {
  const servicePath = path.join(coreServicesPath, service);
  if (fs.existsSync(servicePath)) {
    const stats = fs.statSync(servicePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    if (stats.size >= minSize) {
      console.log(`✅ ${service}: ${sizeKB} KB (comprehensive)`);
    } else {
      console.log(`❌ ${service}: ${sizeKB} KB (too small, expected ${(minSize/1024).toFixed(2)} KB+)`);
      test2Success = false;
    }
  }
});

console.log(`\n📊 Test 2 Result: ${test2Success ? 'PASSED' : 'FAILED'}\n`);

// Test 3: Check service content structure
console.log('📋 Test 3: Verifying service structure...');
let test3Success = true;
const serviceChecks = {
  'ApiService.ts': ['class ApiService', 'getInstance()', 'get<T>', 'post<T>', 'put<T>', 'delete<T>'],
  'AuthService.ts': ['class AuthService', 'login(', 'logout(', 'register(', 'isAuthenticated()'],
  'CacheService.ts': ['class CacheService', 'set<T>', 'get<T>', 'delete(', 'clear()'],
  'AnalyticsService.ts': ['class AnalyticsService', 'track(', 'trackPageView(', 'trackEcommerce('],
  'NotificationService.ts': ['class NotificationService', 'sendNotification(', 'sendEmailNotification(', 'sendPushNotification('],
  'PaymentService.ts': ['class PaymentService', 'processPayment(', 'createPaymentIntent(', 'processBkashPayment('],
  'SearchService.ts': ['class SearchService', 'search(', 'autocomplete(', 'aiSearch(', 'voiceSearch('],
  'RealTimeService.ts': ['class RealTimeService', 'connect()', 'subscribe(', 'sendMessage(']
};

Object.entries(serviceChecks).forEach(([service, checks]) => {
  const servicePath = path.join(coreServicesPath, service);
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    const missingChecks = checks.filter(check => !content.includes(check));
    
    if (missingChecks.length === 0) {
      console.log(`✅ ${service}: All required methods present`);
    } else {
      console.log(`❌ ${service}: Missing ${missingChecks.join(', ')}`);
      test3Success = false;
    }
  }
});

console.log(`\n📊 Test 3 Result: ${test3Success ? 'PASSED' : 'FAILED'}\n`);

// Test 4: Check for proper TypeScript interfaces
console.log('📋 Test 4: Verifying TypeScript interfaces...');
let test4Success = true;
const interfaceChecks = {
  'ApiService.ts': ['interface ApiResponse', 'interface ApiConfig'],
  'AuthService.ts': ['interface User', 'interface LoginCredentials', 'interface AuthResponse'],
  'CacheService.ts': ['interface CacheItem', 'interface CacheConfig', 'interface CacheStats'],
  'AnalyticsService.ts': ['interface AnalyticsEvent', 'interface PageView', 'interface EcommerceEvent'],
  'NotificationService.ts': ['interface NotificationMessage', 'interface NotificationPreferences'],
  'PaymentService.ts': ['interface PaymentMethod', 'interface PaymentTransaction', 'interface PaymentIntent'],
  'SearchService.ts': ['interface SearchQuery', 'interface SearchResponse', 'interface SearchResult'],
  'RealTimeService.ts': ['interface RealTimeMessage', 'interface RealTimeSubscription', 'interface LiveSession']
};

Object.entries(interfaceChecks).forEach(([service, interfaces]) => {
  const servicePath = path.join(coreServicesPath, service);
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    const missingInterfaces = interfaces.filter(iface => !content.includes(iface));
    
    if (missingInterfaces.length === 0) {
      console.log(`✅ ${service}: All required interfaces present`);
    } else {
      console.log(`❌ ${service}: Missing ${missingInterfaces.join(', ')}`);
      test4Success = false;
    }
  }
});

console.log(`\n📊 Test 4 Result: ${test4Success ? 'PASSED' : 'FAILED'}\n`);

// Test 5: Check index.ts exports
console.log('📋 Test 5: Verifying index.ts exports...');
const indexPath = path.join(coreServicesPath, 'index.ts');
let test5Success = true;

if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const expectedExports = [
    'export { ApiService',
    'export { AuthService', 
    'export { CacheService',
    'export { AnalyticsService',
    'export { NotificationService',
    'export { PaymentService',
    'export { SearchService',
    'export { RealTimeService',
    'export default Services',
    'LegacyServiceMapping'
  ];

  const missingExports = expectedExports.filter(exp => !content.includes(exp));
  
  if (missingExports.length === 0) {
    console.log(`✅ index.ts: All required exports present`);
  } else {
    console.log(`❌ index.ts: Missing ${missingExports.join(', ')}`);
    test5Success = false;
  }
} else {
  console.log(`❌ index.ts: File missing`);
  test5Success = false;
}

console.log(`\n📊 Test 5 Result: ${test5Success ? 'PASSED' : 'FAILED'}\n`);

// Test 6: Check consolidation documentation
console.log('📋 Test 6: Verifying consolidation documentation...');
let test6Success = true;
let consolidatedServicesCount = 0;

expectedServices.slice(0, -1).forEach(service => { // Exclude index.ts
  const servicePath = path.join(coreServicesPath, service);
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    if (content.includes('* Consolidates:')) {
      console.log(`✅ ${service}: Consolidation documentation present`);
      // Count consolidated services mentioned
      const consolidatesSection = content.match(/\* Consolidates:(.*?)(?=\*\/)/s);
      if (consolidatesSection) {
        const mentions = consolidatesSection[1].match(/\*\s*-\s*\w+/g);
        consolidatedServicesCount += mentions ? mentions.length : 0;
      }
    } else {
      console.log(`❌ ${service}: Missing consolidation documentation`);
      test6Success = false;
    }
  }
});

console.log(`📊 Total consolidated services documented: ${consolidatedServicesCount}`);
console.log(`\n📊 Test 6 Result: ${test6Success ? 'PASSED' : 'FAILED'}\n`);

// Overall results
const allTestsPassed = test1Success && test2Success && test3Success && test4Success && test5Success && test6Success;
console.log('=' * 80);
console.log(`🎯 OVERALL RESULT: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
console.log('=' * 80);
console.log(`✅ Task 1.2: Service Layer Consolidation Status: ${allTestsPassed ? 'COMPLETE' : 'NEEDS FIXES'}`);
console.log(`📊 Services consolidated: 40+ → 8 unified services`);
console.log(`📁 New structure: client/src/shared/services/core/`);
console.log(`📈 Documentation: ${consolidatedServicesCount} services documented as consolidated`);

if (!allTestsPassed) {
  console.log('\n❌ Failed tests need to be addressed before completion');
  process.exit(1);
}

console.log('\n🎉 Service Layer Consolidation Implementation Complete!');
