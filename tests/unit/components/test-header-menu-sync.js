/**
 * Header Menu Frontend-Backend-Database Synchronization Test
 * Tests all header menu API endpoints for complete synchronization
 */

import fetch from 'cross-fetch';

const BASE_URL = 'http://localhost:5000';

class HeaderMenuSyncTester {
  constructor() {
    this.testResults = [];
    this.passCount = 0;
    this.failCount = 0;
  }

  logTest(testName, success, result, error = null) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${testName}`);
    
    if (success) {
      console.log(`   └── ${result}`);
      this.passCount++;
    } else {
      console.log(`   └── ${error}`);
      this.failCount++;
    }
    
    this.testResults.push({
      test: testName,
      status: success ? 'PASS' : 'FAIL',
      result,
      error
    });
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      return {
        success: response.ok,
        data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  async testCustomerService() {
    const result = await this.makeRequest('/api/help');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Customer Service API', true, 
        `Support channels: ${data.supportChannels.length}, FAQ: ${data.faq.length}`);
    } else {
      this.logTest('Customer Service API', false, null, 
        result.error || 'API response error');
    }
  }

  async testOrderTracking() {
    const result = await this.makeRequest('/api/track/1');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Order Tracking API', true, 
        `Order ID: ${data.orderId}, Status: ${data.status}`);
    } else {
      this.logTest('Order Tracking API', false, null, 
        result.error || 'API response error');
    }
  }

  async testVendorApplication() {
    const applicationData = {
      businessName: 'Test Electronics Store',
      ownerName: 'John Doe',
      email: 'john@teststore.com',
      phone: '01234567890',
      businessType: 'company',
      businessAddress: '123 Main St, Dhaka',
      bankAccount: '1234567890',
      products: ['Electronics', 'Gadgets'],
      businessDescription: 'We sell quality electronics and gadgets for everyday use'
    };
    
    const result = await this.makeRequest('/api/vendor/apply', 'POST', applicationData);
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Vendor Application API', true, 
        `Application ID: ${data.applicationId}, Status: ${data.status}`);
    } else {
      this.logTest('Vendor Application API', false, null, 
        result.error || 'API response error');
    }
  }

  async testVendorDashboard() {
    const result = await this.makeRequest('/api/vendor/dashboard?vendorId=1');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Vendor Dashboard API', true, 
        `Business: ${data.vendor.businessName}, Orders: ${data.metrics.totalOrders}`);
    } else {
      this.logTest('Vendor Dashboard API', false, null, 
        result.error || 'API response error');
    }
  }

  async testVendorBenefits() {
    const result = await this.makeRequest('/api/vendor/benefits');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Vendor Benefits API', true, 
        `Commission: ${data.commission.standard}, Features: ${data.features.length}`);
    } else {
      this.logTest('Vendor Benefits API', false, null, 
        result.error || 'API response error');
    }
  }

  async testUserProfile() {
    const result = await this.makeRequest('/api/profile?userId=1');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('User Profile API', true, 
        `User: ${data.user.name}, Orders: ${data.stats.totalOrders}`);
    } else {
      this.logTest('User Profile API', false, null, 
        result.error || 'API response error');
    }
  }

  async testUserOrders() {
    const result = await this.makeRequest('/api/orders?userId=1');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('User Orders API', true, 
        `Orders: ${data.orders.length}, Total: ${data.pagination.totalOrders}`);
    } else {
      this.logTest('User Orders API', false, null, 
        result.error || 'API response error');
    }
  }

  async testPremiumSubscription() {
    const result = await this.makeRequest('/api/premium');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Premium Subscription API', true, 
        `Plans: ${data.plans.length}, Basic: ${data.plans[0].price} BDT`);
    } else {
      this.logTest('Premium Subscription API', false, null, 
        result.error || 'API response error');
    }
  }

  async testCategories() {
    const result = await this.makeRequest('/api/categories');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Categories API', true, 
        `Categories: ${data.categories.length}, Featured: ${data.featured.length}`);
    } else {
      this.logTest('Categories API', false, null, 
        result.error || 'API response error');
    }
  }

  async testFlashSale() {
    const result = await this.makeRequest('/api/flash-sale');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Flash Sale API', true, 
        `Active: ${data.active}, Products: ${data.products.length}`);
    } else {
      this.logTest('Flash Sale API', false, null, 
        result.error || 'API response error');
    }
  }

  async testDeals() {
    const result = await this.makeRequest('/api/deals');
    
    if (result.success && result.data.success) {
      const data = result.data.data;
      this.logTest('Deals API', true, 
        `Today: ${data.todayDeals.length}, Weekly: ${data.weeklyDeals.length}`);
    } else {
      this.logTest('Deals API', false, null, 
        result.error || 'API response error');
    }
  }

  async runAllTests() {
    console.log('\n🚀 HEADER MENU FRONTEND-BACKEND-DATABASE SYNCHRONIZATION TEST');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Test all header menu endpoints
    await this.testCustomerService();
    await this.testOrderTracking();
    await this.testVendorApplication();
    await this.testVendorDashboard();
    await this.testVendorBenefits();
    await this.testUserProfile();
    await this.testUserOrders();
    await this.testPremiumSubscription();
    await this.testCategories();
    await this.testFlashSale();
    await this.testDeals();

    this.generateReport();
  }

  generateReport() {
    const totalTests = this.passCount + this.failCount;
    const successRate = totalTests > 0 ? (this.passCount / totalTests * 100).toFixed(1) : 0;
    
    console.log('\n📊 HEADER MENU SYNCHRONIZATION TEST RESULTS');
    console.log('═════════════════════════════════════════════════════════');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${this.passCount}`);
    console.log(`Failed: ${this.failCount}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('═════════════════════════════════════════════════════════');
    
    if (this.failCount > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`   • ${result.test}: ${result.error}`);
        });
    }
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT: Header menu synchronization is working perfectly!');
    } else if (successRate >= 70) {
      console.log('\n✅ GOOD: Header menu synchronization is mostly working');
    } else {
      console.log('\n⚠️  NEEDS IMPROVEMENT: Header menu synchronization needs fixes');
    }
  }
}

async function runHeaderMenuSyncTest() {
  const tester = new HeaderMenuSyncTester();
  await tester.runAllTests();
}

// Run the test
runHeaderMenuSyncTest().catch(console.error);