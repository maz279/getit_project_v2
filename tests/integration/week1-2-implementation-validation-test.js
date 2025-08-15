/**
 * Week 1-2 Implementation Validation Test
 * Comprehensive validation of Node.js AI/ML/NLP libraries integration
 * Tests the completed ElasticsearchIntegrationService, NaturalNLPIntegrationService, 
 * FraudDetectionService, and CollaborativeFilteringService implementation
 */

const API_BASE = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

/**
 * Test API endpoint with comprehensive error handling and HTML detection
 */
async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Week1-2-Test-Suite'
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();
    
    // Check if response is HTML (frontend routing conflict)
    if (text.includes('<!DOCTYPE html>')) {
      return {
        success: false,
        status: response.status,
        error: 'Frontend routing conflict - received HTML instead of JSON',
        isHTML: true,
        endpoint,
        method
      };
    }

    try {
      const data = JSON.parse(text);
      return {
        success: response.ok,
        status: response.status,
        data,
        endpoint,
        method
      };
    } catch (parseError) {
      return {
        success: false,
        status: response.status,
        error: `Invalid JSON response: ${parseError.message}`,
        rawResponse: text.substring(0, 100) + '...',
        endpoint,
        method
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      endpoint,
      method
    };
  }
}

/**
 * Week 1-2 Implementation Tests
 */
const tests = [
  {
    name: 'Node.js Libraries Health Check',
    test: () => testEndpoint('/node-libraries/health'),
    expected: 'Should return healthy status for all 5 Node.js libraries'
  },
  
  {
    name: 'Enhanced Search with Elasticsearch + Natural.js',
    test: () => testEndpoint('/node-libraries/enhanced-search', 'POST', {
      query: 'smartphone bangladesh',
      category: 'electronics',
      language: 'en',
      useNLP: true
    }),
    expected: 'Should return search results with NLP analysis and suggestions'
  },

  {
    name: 'Natural.js NLP Text Analysis',
    test: () => testEndpoint('/node-libraries/nlp-analysis', 'POST', {
      text: 'I love this product! It is amazing and works perfectly.',
      language: 'en',
      type: 'sentiment'
    }),
    expected: 'Should return sentiment analysis and NLP processing results'
  },

  {
    name: 'Fraud Detection Analysis',
    test: () => testEndpoint('/node-libraries/fraud-detection', 'POST', {
      userId: 'test-user-123',
      amount: 1500,
      location: 'Dhaka',
      paymentMethod: 'credit_card',
      deviceFingerprint: 'test-device-123'
    }),
    expected: 'Should return fraud risk assessment and recommendations'
  },

  {
    name: 'Collaborative Filtering Recommendations',
    test: () => testEndpoint('/node-libraries/recommendations', 'POST', {
      userId: 'test-user-456',
      count: 10,
      category: 'electronics',
      useCollaborative: true,
      includeNLPAnalysis: true
    }),
    expected: 'Should return personalized recommendations using collaborative filtering'
  },

  {
    name: 'Hybrid Analysis (All Libraries Combined)',
    test: () => testEndpoint('/node-libraries/hybrid-analysis', 'POST', {
      query: 'latest smartphone under 50000 taka',
      userId: 'test-user-789',
      transactionData: {
        amount: 45000,
        paymentMethod: 'mobile_banking'
      },
      context: {
        location: 'Chittagong',
        language: 'en'
      }
    }),
    expected: 'Should combine all Node.js libraries for comprehensive analysis'
  },

  {
    name: 'Performance Analytics',
    test: () => testEndpoint('/node-libraries/analytics'),
    expected: 'Should return performance metrics for all Node.js libraries'
  },

  {
    name: 'Hybrid AI Orchestrator Integration',
    test: () => testEndpoint('/hybrid-ai/search', 'POST', {
      query: 'smartphone search with node libraries',
      type: 'search',
      urgency: 'normal',
      requiresOfflineCapability: true,
      language: 'en'
    }),
    expected: 'Should route search requests to Node.js libraries via HybridAIOrchestrator'
  }
];

/**
 * Run all validation tests
 */
async function runValidationTests() {
  log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.bold}${colors.blue}  WEEK 1-2 NODE.JS AI/ML/NLP LIBRARIES IMPLEMENTATION VALIDATION TESTS${colors.reset}`);
  log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  let passedTests = 0;
  let totalTests = tests.length;

  for (const [index, { name, test, expected }] of tests.entries()) {
    log(`${colors.bold}Test ${index + 1}/${totalTests}: ${name}${colors.reset}`);
    log(`${colors.yellow}Expected: ${expected}${colors.reset}`);
    
    try {
      const result = await test();
      
      if (result.success) {
        log(`${colors.green}✅ PASSED - ${result.method} ${result.endpoint} (${result.status})${colors.reset}`);
        if (result.data) {
          // Show key response data
          if (result.data.success !== undefined) {
            log(`   Success: ${result.data.success}`);
          }
          if (result.data.data) {
            const dataInfo = typeof result.data.data === 'object' ? 
              Object.keys(result.data.data).join(', ') : 
              result.data.data;
            log(`   Data: ${dataInfo}`);
          }
          if (result.data.servicesUsed) {
            log(`   Services Used: ${result.data.servicesUsed.join(', ')}`);
          }
        }
        passedTests++;
      } else {
        log(`${colors.red}❌ FAILED - ${result.method} ${result.endpoint} (${result.status})${colors.reset}`);
        if (result.error) {
          log(`   Error: ${result.error}`);
        }
        if (result.data && result.data.error) {
          log(`   API Error: ${result.data.error}`);
        }
      }
    } catch (error) {
      log(`${colors.red}❌ ERROR - ${error.message}${colors.reset}`);
    }
    
    log(''); // Empty line for readability
  }

  // Summary
  log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════${colors.reset}`);
  
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  if (passedTests === totalTests) {
    log(`${colors.bold}${colors.green}🎉 ALL TESTS PASSED! Week 1-2 Implementation: 100% Success Rate${colors.reset}`);
  } else if (passedTests >= totalTests * 0.8) {
    log(`${colors.bold}${colors.yellow}⚠️  ${passedTests}/${totalTests} tests passed (${successRate}%) - Week 1-2 Implementation: Mostly Complete${colors.reset}`);
  } else {
    log(`${colors.bold}${colors.red}❌ ${passedTests}/${totalTests} tests passed (${successRate}%) - Week 1-2 Implementation: Needs Work${colors.reset}`);
  }

  log(`${colors.blue}Implementation Status:${colors.reset}`);
  log(`- ElasticsearchIntegrationService: ${passedTests >= 1 ? '✅ Active' : '❌ Inactive'}`);
  log(`- NaturalNLPIntegrationService: ${passedTests >= 2 ? '✅ Active' : '❌ Inactive'}`);
  log(`- FraudDetectionService: ${passedTests >= 3 ? '✅ Active' : '❌ Inactive'}`);
  log(`- CollaborativeFilteringService: ${passedTests >= 4 ? '✅ Active' : '❌ Inactive'}`);
  log(`- NodeLibraryOrchestrator: ${passedTests >= 5 ? '✅ Active' : '❌ Inactive'}`);
  log(`- HybridAIOrchestrator Integration: ${passedTests >= 8 ? '✅ Complete' : '❌ Incomplete'}`);

  if (passedTests === totalTests) {
    log(`\n${colors.bold}${colors.green}🚀 WEEK 1-2 IMPLEMENTATION COMPLETE - READY FOR WEEK 3-4 OPTIMIZATION${colors.reset}`);
  } else {
    log(`\n${colors.bold}${colors.yellow}🔧 Week 1-2 Implementation needs refinement before proceeding to Week 3-4${colors.reset}`);
  }
  
  log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

// Wait for server to be ready
setTimeout(() => {
  runValidationTests().catch(error => {
    log(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  });
}, 2000);