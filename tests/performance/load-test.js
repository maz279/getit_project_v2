/**
 * K6 Load Testing Script for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level Performance Testing
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time', true);
const requestCounter = new Counter('total_requests');

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Ramp up to 100 users
    { duration: '10m', target: 200 }, // Ramp up to 200 users
    { duration: '15m', target: 500 }, // Peak load
    { duration: '10m', target: 200 }, // Ramp down
    { duration: '5m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
    errors: ['rate<0.01'],            // Custom error rate under 1%
  },
};

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

const testProducts = [
  'smartphone', 'laptop', 'headphones', 'clothing', 'books',
  'furniture', 'electronics', 'sports', 'beauty', 'home'
];

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Helper function to make authenticated requests
function makeAuthenticatedRequest(url, payload = null, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'K6-LoadTest/1.0',
    ...headers,
  };

  let response;
  if (payload) {
    response = http.post(url, JSON.stringify(payload), { headers: defaultHeaders });
  } else {
    response = http.get(url, { headers: defaultHeaders });
  }

  // Track custom metrics
  errorRate.add(response.status >= 400);
  responseTimeTrend.add(response.timings.duration);
  requestCounter.add(1);

  return response;
}

// Test scenarios
export default function () {
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Homepage and product browsing
    testHomepageBrowsing();
  } else if (scenario < 0.6) {
    // 30% - Search functionality
    testSearchFunctionality();
  } else if (scenario < 0.8) {
    // 20% - User authentication flow
    testUserAuthentication();
  } else if (scenario < 0.95) {
    // 15% - Shopping cart operations
    testShoppingCart();
  } else {
    // 5% - API performance testing
    testAPIPerformance();
  }

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

function testHomepageBrowsing() {
  const group = 'Homepage Browsing';
  
  // Load homepage
  let response = makeAuthenticatedRequest(`${BASE_URL}/`);
  check(response, {
    [`${group} - Homepage loads`]: (r) => r.status === 200,
    [`${group} - Homepage response time < 1s`]: (r) => r.timings.duration < 1000,
  });

  // Load categories
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/categories`);
  check(response, {
    [`${group} - Categories load`]: (r) => r.status === 200,
    [`${group} - Categories data exists`]: (r) => r.json().length > 0,
  });

  // Load featured products
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/products/featured`);
  check(response, {
    [`${group} - Featured products load`]: (r) => r.status === 200,
  });

  // Simulate product detail view
  const productId = Math.floor(Math.random() * 100) + 1;
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/products/${productId}`);
  check(response, {
    [`${group} - Product detail loads`]: (r) => r.status === 200 || r.status === 404,
  });
}

function testSearchFunctionality() {
  const group = 'Search Functionality';
  const searchTerm = testProducts[Math.floor(Math.random() * testProducts.length)];
  
  // Search products
  let response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/search?q=${searchTerm}`);
  check(response, {
    [`${group} - Search executes`]: (r) => r.status === 200,
    [`${group} - Search response time < 500ms`]: (r) => r.timings.duration < 500,
  });

  // Advanced search
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/search/advanced`, {
    query: searchTerm,
    category: 'electronics',
    priceMin: 10,
    priceMax: 1000,
    sortBy: 'relevance'
  });
  check(response, {
    [`${group} - Advanced search executes`]: (r) => r.status === 200,
  });

  // Search suggestions
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/search/suggestions?q=${searchTerm.substring(0, 3)}`);
  check(response, {
    [`${group} - Search suggestions load`]: (r) => r.status === 200,
  });
}

function testUserAuthentication() {
  const group = 'User Authentication';
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // User registration (simulate)
  let response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/auth/register`, {
    email: `load_test_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Load',
    lastName: 'Test'
  });
  check(response, {
    [`${group} - Registration processes`]: (r) => r.status === 201 || r.status === 409, // 409 if user exists
  });

  // User login
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/auth/login`, {
    email: user.email,
    password: user.password
  });
  check(response, {
    [`${group} - Login processes`]: (r) => r.status === 200 || r.status === 401,
  });

  // Get user profile
  if (response.status === 200) {
    const token = response.json().token;
    response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/auth/profile`, null, {
      'Authorization': `Bearer ${token}`
    });
    check(response, {
      [`${group} - Profile loads`]: (r) => r.status === 200,
    });
  }
}

function testShoppingCart() {
  const group = 'Shopping Cart';
  const productId = Math.floor(Math.random() * 100) + 1;
  
  // Add to cart
  let response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/cart/add`, {
    productId: productId,
    quantity: Math.floor(Math.random() * 3) + 1
  });
  check(response, {
    [`${group} - Add to cart processes`]: (r) => r.status === 200 || r.status === 201,
  });

  // Get cart
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/cart`);
  check(response, {
    [`${group} - Cart retrieval`]: (r) => r.status === 200,
  });

  // Update cart item
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/cart/update`, {
    productId: productId,
    quantity: 2
  });
  check(response, {
    [`${group} - Cart update processes`]: (r) => r.status === 200,
  });

  // Calculate shipping
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/cart/shipping`, {
    address: {
      city: 'Dhaka',
      area: 'Dhanmondi',
      zipCode: '1205'
    }
  });
  check(response, {
    [`${group} - Shipping calculation`]: (r) => r.status === 200,
  });
}

function testAPIPerformance() {
  const group = 'API Performance';
  
  // Health check
  let response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/health`);
  check(response, {
    [`${group} - Health check`]: (r) => r.status === 200,
    [`${group} - Health check fast`]: (r) => r.timings.duration < 100,
  });

  // Enterprise health check
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/health/enterprise`);
  check(response, {
    [`${group} - Enterprise health check`]: (r) => r.status === 200 || r.status === 206,
  });

  // Metrics endpoint
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/metrics`);
  check(response, {
    [`${group} - Metrics endpoint`]: (r) => r.status === 200,
  });

  // Database performance
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/health/database`);
  check(response, {
    [`${group} - Database health`]: (r) => r.status === 200,
  });

  // Cache performance
  response = makeAuthenticatedRequest(`${BASE_URL}/api/v1/health/cache`);
  check(response, {
    [`${group} - Cache health`]: (r) => r.status === 200,
  });
}

// Setup function
export function setup() {
  console.log('🚀 Starting Load Test for GetIt Bangladesh');
  console.log(`📊 Target URL: ${BASE_URL}`);
  console.log('🎯 Test Scenarios:');
  console.log('   - 30% Homepage browsing');
  console.log('   - 30% Search functionality');
  console.log('   - 20% User authentication');
  console.log('   - 15% Shopping cart operations');
  console.log('   - 5% API performance testing');
  
  // Warmup request
  const warmupResponse = makeAuthenticatedRequest(`${BASE_URL}/api/v1/health`);
  if (warmupResponse.status !== 200) {
    console.error('❌ Warmup failed - server may not be ready');
  } else {
    console.log('✅ Warmup successful - starting load test');
  }
}

// Teardown function
export function teardown(data) {
  console.log('🏁 Load Test Completed');
  console.log('📈 Check the results in the K6 summary');
}